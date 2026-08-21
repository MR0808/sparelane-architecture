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
tests:
  - E2E-SET-001
  - FIN-INV-05
---

# Merchant Settlement

## Purpose

After ledger confirmation, settlement-worker creates a per-collection Settlement obligation (PENDING), evaluates eligibility (→ ELIGIBLE or remain PENDING), then — in later phases — optional batching and banking instruction. Partner acknowledgement is **not** SETTLED.

Binding policy: [ADR-027](../../decisions/ADR-027-settlement-obligation-eligibility-cardinality.md).

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
    participant Mer as Merchant / KYB port
    participant Batch as Settlement Batch Service
    participant Inst as Settlement Instruction Service
    participant Bank as Banking / Settlement Partner

    Bus->>SW: LedgerPostingConfirmed
    SW->>Led: Load collection journal + payable CREDIT
    SW->>SW: CreateSettlement PENDING + SettlementCreated
    SW->>Mer: Evaluate status + APPROVED_FOR_SETTLEMENT
    alt Eligibility satisfied
        SW->>SW: PENDING → ELIGIBLE + SettlementEligible
    else Temporarily blocked
        SW->>SW: Remain PENDING
    end

    Note over SW,Bank: F0 stops here — no batch, instruction, or bank call

    opt Post-F0 batching applies
        SW->>Batch: Group ELIGIBLE settlements
        Batch-->>SW: BATCHED
    end

    opt Post-F0 execution
        SW->>Inst: Request settlement instruction
        Inst->>Bank: Submit settlement instruction
        SW->>SW: → SUBMITTED
        Bank-->>Inst: Ack receipt / processing
        SW->>SW: → PROCESSING
        Note over SW,Bank: Acknowledgement != SETTLED
    end
```

## Important invariants

- Must not create Settlement unless workflow COLLECTED and ledger posting CONFIRMED.
- One Settlement per `payment_workflow_id` (unique).
- Amount = journal merchant payable CREDIT (gross); not aggregate balance.
- Ack / PROCESSING is not terminal SETTLED.
- Settlement lifecycle is separate from Payment Workflow (ADR-006).

## Failure notes

- Merchant/KYB ineligible → remain PENDING (not FAILED).
- Partner unavailable → RETRY_PENDING / outage path (SEQ-OPS-004) — post-F0.
- Unknown outcome after submit → SEQ-MONEY-005 (do not blind resubmit) — post-F0.

## Related

LikeC4: `merchantSettlement`. STATE-MONEY-001. ADR-027.
