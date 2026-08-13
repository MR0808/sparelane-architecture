---
id: SEQ-MONEY-004
title: Settlement Failure
type: sequence
area: money
status: accepted
mvp: false
likec4:
  - settlementFailure
requirements:
  - FUN-SET-006
  - FUN-SET-007
  - BUS-004
adrs:
  - ADR-005
  - ADR-006
tests:
  - E2E-SET-003
  - FIN-INV-07
---

# Settlement Failure

## Purpose

Provider reports settlement failure. Consumer collection remains COLLECTED. Settlement may retry within bounds or escalate; do not reverse the successful consumer payment solely because merchant settlement failed.

## Preconditions

- Settlement was SUBMITTED or PROCESSING.
- Verified provider failure (or definitive negative reconciliation).

## Mermaid

```mermaid
sequenceDiagram
    autonumber
    participant Bank as Banking / Settlement Partner
    participant WH as Webhook Ingress
    participant Bus as Event Bus
    participant SS as Settlement Service
    participant Rec as Settlement Reconciliation
    participant Led as Ledger Service
    participant Inst as Settlement Instruction Service
    participant Alert as Alerting
    participant PSM as Payment State Machine

    Bank->>WH: Settlement failure
    WH->>Bus: Verified settlement failure
    Bus->>SS: Apply failure → FAILED
    SS->>Rec: Reconcile unpaid vs ledger
    opt Compensating / exception entries required
        SS->>Led: Post exception entries
    end

    alt Bounded retry permitted
        SS->>Inst: Schedule settlement retry
        SS->>SS: → RETRY_PENDING
    else Unresolved
        SS->>Alert: Escalate to operations
    end

    Note over PSM: Payment Workflow remains COLLECTED — no reversal
```

## Important invariants

- Consumer payment stays COLLECTED.
- Do not reverse collection merely for settlement failure.
- FAILED → RETRY_PENDING only if product rules permit.

## Failure notes

- Exhausted settlement retries remain FAILED for ops handling.
- No Payment Workflow transition to FAILED from settlement failure.

## Related

LikeC4: `settlementFailure`. ADR-005 / ADR-006.
