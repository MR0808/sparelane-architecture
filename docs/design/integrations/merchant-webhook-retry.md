---
id: SEQ-INT-004
title: Merchant Webhook Retry
type: sequence
area: integrations
status: accepted
mvp: true
likec4:
  - merchantWebhookRetry
requirements:
  - FUN-MER-004
  - NFR-REL-003
adrs:
  - ADR-009
  - ADR-017
  - ADR-023
tests:
  - CON-WEBHOOK-001
  - OPS-REC-002
---

# Merchant Webhook Retry

## Purpose

Retryable webhook delivery failure schedules a bounded retry of the **same** Webhook Event ID. Retries do not create a new domain event.

## Preconditions

- Prior delivery attempt timed out or returned temporary 5xx.
- Bounded retry budget remains for the delivery.

## Mermaid

```mermaid
sequenceDiagram
    autonumber
    participant WHD as Webhook Delivery
    participant MBE as Merchant Backend
    participant ODB as Operational DB

    WHD->>MBE: Deliver signed webhook (Event ID E1)
    MBE--xWHD: Timeout or temporary 5xx
    WHD->>ODB: Record failed attempt — schedule bounded retry
    Note over WHD,ODB: Same webhook_events.id / public Event ID E1 — no new event

    WHD->>MBE: Redeliver same signed Event ID E1
    MBE-->>WHD: 2xx acknowledgement
    WHD->>ODB: Mark delivery successful
```

## Important invariants

- Retry reuses the same Webhook Event ID; no new domain event.
- Delivery attempts are append-oriented (PENDING → DELIVERING → SUCCEEDED / RETRY_PENDING / FAILED).
- Merchant must treat duplicate deliveries as idempotent.

## Failure notes

- Exhausted retries → delivery FAILED; ops may investigate; domain state unchanged.

## Related

LikeC4: `merchantWebhookRetry`. Schema webhook delivery attempts.
