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
tests:
  - E2E-SET-001
  - E2E-SET-003
  - FIN-INV-05
---

# Settlement State Machine

## Purpose

Legal settlement lifecycle states and transitions from `docs/schema/state-transitions.md` and `docs/money/settlement-state-machine.md`. Separate from Payment Workflow.

## Preconditions

- Settlement eligibility requires Payment Workflow COLLECTED and ledger posting CONFIRMED.
- Batching is optional; providers may skip BATCHED.

## Mermaid

```mermaid
stateDiagram-v2
    [*] --> PENDING

    PENDING --> ELIGIBLE
    PENDING --> CANCELLED

    ELIGIBLE --> BATCHED
    ELIGIBLE --> SUBMITTED
    ELIGIBLE --> CANCELLED

    BATCHED --> SUBMITTED
    BATCHED --> CANCELLED

    SUBMITTED --> PROCESSING
    SUBMITTED --> FAILED
    SUBMITTED --> RETRY_PENDING

    PROCESSING --> SETTLED
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

- Must not SUBMIT unless payment COLLECTED and ledger CONFIRMED.
- Ack alone is not SETTLED.
- Settlement FAILED does not reverse consumer COLLECTED.

## Failure notes

- Invalid: Payment not COLLECTED → SUBMITTED; SETTLED → SUBMITTED without reversal design; FAILED → SETTLED without confirmation + recon.

## Related

Payment workflow remains COLLECTED during settlement failure/outage.
