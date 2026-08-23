---
id: SEQ-NOT-004
title: Consumer notification contact onboarding
type: sequence
area: notifications
status: accepted
mvp: true
requirements:
  - FUN-NOT-001
adrs:
  - ADR-031
tests:
  - CON-NOT-001
---

# Consumer notification contact onboarding

## Purpose

Explicit promotion of a communication destination separate from authentication identity.

## Preconditions

- Authenticated consumer portal session
- Supplied email ≠ automatic use of `users.email` unless user explicitly enters it

## Mermaid

```mermaid
sequenceDiagram
    autonumber
    participant Cons as Consumer (portal)
    participant API as Portal BFF
    participant Notif as Notifications
    participant Email as EmailProvider

    Cons->>API: Add notification email
    API->>Notif: AddConsumerNotificationContact
    Notif->>Notif: PENDING contact (normalised email)
    Notif->>Email: contact_verify_v1 to supplied address
    Email-->>Notif: accepted
    Cons->>API: Verify token/link
    API->>Notif: VerifyConsumerNotificationContact
    Notif->>Notif: ACTIVE — set default if first ACTIVE

    Note over Cons,Notif: users.email unchanged — auth boundary preserved
```

## Invariants

- Verification required before payment notifications send
- Auth email never silently copied to contact table
