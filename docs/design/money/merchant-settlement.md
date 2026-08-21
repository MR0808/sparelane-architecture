---
id: SEQ-MONEY-002
title: Merchant Settlement
type: sequence
area: money
status: accepted
mvp: false
likec4:
  - merchantSettlement
requirements:
  - FUN-SET-001
  - FUN-SET-002
  - FUN-SET-003
  - INT-SET-001
adrs:
  - ADR-005
  - ADR-006
  - ADR-004
  - ADR-026
  - ADR-027
  - ADR-028
tests:
  - E2E-SET-001
  - FIN-INV-05
---

# Merchant Settlement

## Purpose

After ledger confirmation, settlement-worker creates a per-collection Settlement obligation (PENDING), evaluates eligibility (→ ELIGIBLE or remain PENDING), then — in F1 — resolves payout destination, creates one SettlementInstruction, and submits via provider-neutral port (Fake locally). Partner acknowledgement is **not** SETTLED.

Binding policy: [ADR-027](../../decisions/ADR-027-settlement-obligation-eligibility-cardinality.md), [ADR-028](../../decisions/ADR-028-settlement-execution-payout-destination-instruction-idempotency.md).

## Preconditions

- Payment Workflow is COLLECTED.
- Ledger posting status is CONFIRMED.
- ADR-026 collection journal exists (`payment-collection:{paymentWorkflowPublicId}`).

## Mermaid

```mermaid
sequenceDiagram
    autonumber
    participant Bus as Event Bus
    participant SW as settlement-worker
    participant Led as Ledger Service
    participant Mer as Merchant / KYB / Destination
    participant Inst as Settlement Instruction
    participant Bank as SettlementProvider (Fake / partner)

    Bus->>SW: LedgerPostingConfirmed
    SW->>Led: Load collection journal + payable CREDIT
    SW->>SW: CreateSettlement PENDING + SettlementCreated
    SW->>Mer: Evaluate status + APPROVED_FOR_SETTLEMENT
    alt Eligibility satisfied
        SW->>SW: PENDING → ELIGIBLE + SettlementEligible
    else Temporarily blocked
        SW->>SW: Remain PENDING
    end

    Note over SW,Bank: F0 stops here

    Note over SW,Bank: F1 — no SettlementBatch
    Bus->>SW: SettlementEligible
    SW->>Mer: Resolve default destination + recheck merchant/KYB/destination
    alt Pre-submit gate fail
        SW->>SW: Remain ELIGIBLE (hold) — no FAILED
    else Gates pass
        SW->>Inst: TX A CreateSettlementInstruction CREATED
        Inst-->>SW: SettlementInstructionCreated
        SW->>Bank: submitSettlementInstruction (idempotency key)
        alt accepted
            SW->>SW: TX B → SUBMITTED + SettlementSubmitted
            Note over SW: F1 end — not SETTLED
        else rejected
            SW->>SW: TX B → FAILED + SettlementFailed
        else technical_error
            SW->>SW: Retry same instruction/key (bounded)
        else unknown_outcome
            SW->>SW: TX B → SUBMITTED + OUTCOME_UNKNOWN hold
            SW->>Bank: lookupSettlementInstruction (no new key)
        end
    end
```

## Important invariants

- Must not create Settlement unless workflow COLLECTED and ledger posting CONFIRMED.
- One Settlement per `payment_workflow_id` (unique).
- One SettlementInstruction per Settlement (unique); amount = Settlement gross.
- Ack / SUBMITTED / PROCESSING is not terminal SETTLED.
- Settlement lifecycle is separate from Payment Workflow (ADR-006).
- No MVP batching (ADR-028).

## Failure notes

- Merchant/KYB ineligible → remain PENDING (not FAILED).
- Missing/invalid destination at submit → remain ELIGIBLE hold (not FAILED).
- Partner unavailable → RETRY_PENDING / outage path (SEQ-OPS-004).
- Unknown outcome after submit → SEQ-MONEY-005 (do not blind resubmit).

## Related

LikeC4: `merchantSettlement`. STATE-MONEY-001. ADR-027. ADR-028.
