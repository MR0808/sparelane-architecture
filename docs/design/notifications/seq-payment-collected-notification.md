---
id: SEQ-NOT-003
title: Payment collected consumer notification
type: sequence
area: notifications
status: accepted
mvp: true
requirements:
  - FUN-NOT-004
adrs:
  - ADR-026
  - ADR-031
tests:
  - CON-NOT-001
---

# Payment collected — consumer notification

## Purpose

Confirm successful payment collection to the consumer via mandatory transactional email.

## Preconditions

- `PaymentCollected` emitted
- Workflow `COLLECTED`
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

    Orch->>Bus: PaymentCollected
    Bus->>NW: ProjectConsumerNotification (payment.collected)
    NW->>Notif: notify:payment.collected:{wfPublicId}
    Notif->>Email: sendEmail (payment_collected_v1)
    Email-->>Notif: accepted

    Note over Orch,Notif: Ledger posting is separate path — notification does not post journal
```

## Invariants

- One confirmation per collected workflow
- No settlement or ledger details in template variables
