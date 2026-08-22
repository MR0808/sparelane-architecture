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
  - ADR-030
tests:
  - CON-WEBHOOK-001
  - E2E-WEB-001
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
    participant ODB as Operational DB
    participant MBE as Merchant Backend

    Bus->>WHD: Curated internal event
    WHD->>ODB: ProjectMerchantWebhook (idempotent evt_)
    WHD->>ODB: Create delivery per ACTIVE subscribed endpoint
    WHD->>MBE: POST signed body (same bytes HMAC'd)
    MBE->>MBE: Verify HMAC — process idempotently by evt_
    MBE-->>WHD: 2xx
    WHD->>ODB: Append attempt SUCCEEDED
```

## Important invariants

- Stable public Webhook Event ID across retries and endpoints.
- At-least-once delivery; merchant idempotency required.
- Only closed catalogue types (ADR-030). HTTP outside DB transaction.
- Duplicate internal events → same `evt_…`.

## Failure notes

- Timeout / 5xx → SEQ-INT-004 retry of same event ID.

## Related

LikeC4: `merchantWebhookDelivery`. ADR-009 / ADR-030.
