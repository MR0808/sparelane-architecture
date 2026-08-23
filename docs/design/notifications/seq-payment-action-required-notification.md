---
id: SEQ-NOT-001
title: Payment action required consumer notification
type: sequence
area: notifications
status: accepted
mvp: true
likec4: []
requirements:
  - FUN-NOT-002
adrs:
  - ADR-024
  - ADR-031
tests:
  - CON-NOT-001
---

# Payment action required — consumer notification

## Purpose

When a payment workflow enters `ACTION_REQUIRED`, project and deliver a mandatory transactional email to the consumer's ACTIVE default notification contact.

## Preconditions

- Workflow transitioned to `ACTION_REQUIRED` (automatic recovery exhausted; window still open)
- Consumer has ACTIVE verified default email contact
- Closed mapping per ADR-031

## Mermaid

```mermaid
sequenceDiagram
    autonumber
    participant Orch as Payment Orchestrator
    participant Bus as Event Bus
    participant NW as notification-worker
    participant Notif as Notifications
    participant Contacts as ConsumerNotificationContact
    participant Email as EmailProvider
    participant Cons as Consumer

    Orch->>Bus: Workflow → ACTION_REQUIRED (first entry)
    Bus->>NW: ProjectConsumerNotification
    NW->>Notif: Resolve workflow → bill → connection → consumer
    Notif->>Contacts: Load ACTIVE default EMAIL
    Contacts-->>Notif: contact + normalised email
    Notif->>Notif: Idempotent notify:payment.action_required:{wfPublicId}
    Notif->>Email: sendEmail (outside TX)
    Email-->>Notif: accepted + providerMessageRef
    Notif->>Cons: Email handed to provider (not inbox guarantee)

    Note over Orch,Notif: No Bill/Payment/Ledger mutation
```

## No contact path

If no ACTIVE default contact: `ConsumerNotification` → `SKIPPED` (`NO_ACTIVE_CONTACT`); no EmailProvider call.

## Invariants

- One logical notification per workflow for this type
- No notification on every retryable decline
- Recipient from authoritative DB graph only
