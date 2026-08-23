# Consumer notification delivery

Delivery semantics for G2 consumer email. Authority: [ADR-031](../decisions/ADR-031-consumer-notification-contact-channel-and-delivery-policy.md).

## Model

```text
ConsumerNotification          (logical intent)
ConsumerNotificationDeliveryAttempt   (provider transport)
```

## Projection → delivery

```text
closed domain event mapping
→ ProjectConsumerNotification (idempotent)
→ ConsumerNotification (PENDING | SKIPPED)
→ DeliverConsumerNotification (if PENDING)
→ attempts → SENT | FAILED
```

## Idempotency

```text
business_reference = notify:{notification_type}:{payment_workflow_public_id}
provider idempotencyKey = business_reference
```

## Provider outcomes

| Outcome | Retry? | Notification status |
| --- | --- | --- |
| `accepted` | — | `SENT` |
| `rejected` | No | `FAILED` |
| `technical_error` | Yes | retry or `FAILED` |
| `unknown` | Yes | retry or `FAILED` |

`accepted` means provider accepted message for sending — **not** inbox delivery/read.

## Retry schedule

5 attempts; delays 2m, 10m, 1h, 6h (independent from merchant webhook retry).

## No destination

`SKIPPED` + `NO_ACTIVE_CONTACT`; no provider call; no retroactive send when contact added later.

## Worker

`notification-worker` handles `notification.*` jobs separately from `webhook.*`.

## Financial boundary

Delivery success/failure must not mutate payment, ledger, or settlement state.
