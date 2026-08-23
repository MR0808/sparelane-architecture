---
id: SEQ-NOT-002
title: Payment failed consumer notification
type: sequence
area: notifications
status: accepted
mvp: true
requirements:
  - FUN-NOT-003
  - FUN-PAY-007
adrs:
  - ADR-024
  - ADR-025
  - ADR-031
tests:
  - CON-NOT-001
designs:
  - SEQ-PAY-006
---

# Payment failed — consumer notification

## Purpose

On terminal `PaymentFailed`, deliver mandatory transactional email alongside merchant webhook (SEQ-PAY-006).

## Preconditions

- Workflow → `FAILED` with ADR-024/025 guards satisfied
- `PaymentFailed` emitted once
- Consumer ACTIVE default email (or SKIPPED)

## Mermaid

```mermaid
sequenceDiagram
    autonumber
    participant Orch as Payment Orchestrator
    participant Bus as Event Bus
    participant NW as notification-worker
    participant Notif as Notifications
    participant Email as EmailProvider
    participant WH as Merchant Webhooks

    Orch->>Bus: PaymentFailed
    Bus->>NW: ProjectConsumerNotification (payment.failed)
    NW->>Notif: Idempotent intent + deliver
    Notif->>Email: sendEmail
    Bus->>NW: ProjectMerchantWebhook (payment.failed)
    NW->>WH: Deliver signed HTTP

    Note over Orch,WH: Financial state terminal FAILED — no ledger collection
```

## Invariants

- Not triggered by intermediate declines or retryable attempts alone
- Same idempotency key on replay after crash
