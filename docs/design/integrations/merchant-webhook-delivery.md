---
id: SEQ-INT-003
title: Merchant Webhook Delivery
type: sequence
area: integrations
status: accepted
mvp: true
likec4:
  - merchantWebhookDelivery
requirements:
  - FUN-MER-004
  - FUN-MER-006
adrs:
  - ADR-009
  - ADR-023
  - ADR-017
tests:
  - CON-WEBHOOK-001
---

# Merchant Webhook Delivery

## Purpose

Internal domain event is mapped to a merchant-facing webhook, signed, and delivered. Merchants must process event IDs idempotently because delivery is at-least-once.

## Preconditions

- Curated merchant-facing event is eligible for delivery.
- Merchant webhook endpoint configured and active.
- Signing secret available from secrets management.

## Mermaid

```mermaid
sequenceDiagram
    autonumber
    participant Bus as Event Bus
    participant WHD as Webhook Delivery
    participant Int as Merchant Integration Service
    participant MBE as Merchant Backend
    participant ODB as Operational DB

    Bus->>WHD: Select merchant-facing event
    WHD->>Int: Load webhook endpoint configuration
    WHD->>MBE: Deliver signed payload + stable Webhook Event ID
    MBE->>MBE: Verify signature — process idempotently
    MBE-->>WHD: 2xx
    WHD->>ODB: Mark delivery attempt SUCCEEDED
```

## Important invariants

- Stable public Webhook Event ID across retries.
- At-least-once delivery; merchant idempotency required.
- Only curated external events (ADR-023).

## Failure notes

- Timeout / 5xx → SEQ-INT-004 retry of same event ID.

## Related

LikeC4: `merchantWebhookDelivery`. ADR-009.
