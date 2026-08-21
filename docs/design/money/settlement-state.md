---
id: STATE-MONEY-001
title: Settlement State Machine
type: state
area: money
status: accepted
mvp: false
likec4:
  - merchantSettlement
  - settlementConfirmation
  - settlementFailure
requirements:
  - FUN-SET-001
  - FUN-SET-004
  - FUN-SET-006
adrs:
  - ADR-005
  - ADR-006
  - ADR-027
  - ADR-028
tests:
  - E2E-SET-001
  - E2E-SET-003
  - FIN-INV-05
---

# Settlement State Machine

## Purpose

Legal settlement lifecycle states and transitions from `docs/schema/state-transitions.md` and `docs/money/settlement-state-machine.md`. Separate from Payment Workflow. Obligation/eligibility: [ADR-027](../../decisions/ADR-027-settlement-obligation-eligibility-cardinality.md). Execution: [ADR-028](../../decisions/ADR-028-settlement-execution-payout-destination-instruction-idempotency.md).

## Preconditions

- Settlement creation requires Payment Workflow COLLECTED and ledger posting CONFIRMED.
- Initial status PENDING; ELIGIBLE after merchant/KYB gates.
- Batching is optional and **not used in F1**; providers may skip BATCHED.
- Provider accepted → SUBMITTED; SETTLED only after reconciliation (F2+).

## Mermaid

```mermaid
stateDiagram-v2
    [*] --> PENDING

    PENDING --> ELIGIBLE
    PENDING --> CANCELLED

    ELIGIBLE --> BATCHED: future batching only
    ELIGIBLE --> SUBMITTED: F1 accepted or unknown hold
    ELIGIBLE --> CANCELLED

    BATCHED --> SUBMITTED
    BATCHED --> CANCELLED

    SUBMITTED --> PROCESSING
    SUBMITTED --> FAILED
    SUBMITTED --> RETRY_PENDING

    PROCESSING --> SETTLED: F2+ recon only
    PROCESSING --> FAILED
    PROCESSING --> RETRY_PENDING

    FAILED --> RETRY_PENDING

    RETRY_PENDING --> SUBMITTED
    RETRY_PENDING --> FAILED
    RETRY_PENDING --> CANCELLED

    SETTLED --> [*]
    CANCELLED --> [*]
```

## Important invariants

- Must not create/SUBMIT unless payment COLLECTED and ledger CONFIRMED.
- One Settlement per payment workflow (unique).
- One SettlementInstruction per Settlement (F1); same key on technical retry.
- Merchant/KYB block → remain PENDING (not FAILED); destination pre-submit fail → remain ELIGIBLE hold.
- Ack alone is not SETTLED; F1 ends at SUBMITTED.
- Settlement FAILED does not reverse consumer COLLECTED.
- FAILED is recoverable via RETRY_PENDING when permitted (not unconditionally terminal).
- Unknown outcome → SUBMITTED + instruction OUTCOME_UNKNOWN — not FAILED.

## Failure notes

- Invalid: Payment not COLLECTED → SUBMITTED; SETTLED → SUBMITTED without reversal design; FAILED → SETTLED without confirmation + recon; ineligibility → FAILED; unknown → FAILED to force retry.

## Related

Payment workflow remains COLLECTED during settlement failure/outage. SEQ-MONEY-002. ADR-028.
