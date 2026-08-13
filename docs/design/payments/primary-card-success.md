---
id: SEQ-PAY-003
title: Primary Card Success
type: sequence
area: payments
status: accepted
mvp: true
likec4:
  - primaryCardSuccess
  - paymentLifecycle
requirements:
  - FUN-PAY-001
  - FUN-PAY-004
  - FUN-PAY-005
adrs:
  - ADR-002
  - ADR-003
  - ADR-005
  - ADR-016
tests:
  - E2E-PAY-001
  - E2E-PAY-002
  - FIN-INV-01
---

# Primary Card Success

## Purpose

Happy-path collection on the primary card: workflow reaches COLLECTED, outbox is written, and ledger posting is triggered. Settlement detail is out of scope here.

## Preconditions

- Payment Workflow is SCHEDULED, PREAUTHORISED, or otherwise due for collection.
- Primary card is eligible.
- Risk checks allow the attempt.

## Mermaid

```mermaid
sequenceDiagram
    autonumber
    participant Sch as Bill Scheduler
    participant Orch as Payment Orchestrator
    participant PSM as Payment State Machine
    participant Rel as Reliability Engine
    participant Att as Payment Attempt Service
    participant Card as Card Adapter
    participant PSP as Card Adapter / PSP
    participant WH as Webhook Ingress
    participant ODB as Operational DB
    participant OB as Outbox Publisher

    Sch->>Orch: Payment action due
    Orch->>PSM: Transition → PAYMENT_PENDING
    Orch->>Rel: Next eligible method
    Rel-->>Orch: Primary card
    Orch->>Att: Create payment attempt
    Orch->>Card: Initiate primary card payment
    Card->>PSP: Authorise / capture
    Att->>Att: Attempt SUBMITTED

    PSP-->>WH: Successful capture webhook
    WH-->>Orch: Verified PaymentSucceeded event
    Orch->>Att: Mark attempt CAPTURED
    Orch->>PSM: Transition → COLLECTED
    Orch->>ODB: Commit COLLECTED + ledger_posting_status=PENDING + outbox
    ODB-->>OB: Outbox row ready
    OB-->>Orch: Collection posting event published

    Note over Orch,OB: Stop before settlement — eligibility needs ledger CONFIRMED
```

## Important invariants

- COLLECTED means consumer funds collected — not merchant settled.
- COLLECTED and outbox write are atomic on Operational DB.
- Settlement eligibility requires `ledger_posting_status = CONFIRMED` (see SEQ-MONEY-001).

## Failure notes

- Capture decline → backup / retry paths (SEQ-PAY-004 / SEQ-PAY-005), not settlement.
- Do not mark SETTLED from this flow.

## Related

LikeC4: `primaryCardSuccess`, `paymentLifecycle`. Continues in SEQ-MONEY-001.
