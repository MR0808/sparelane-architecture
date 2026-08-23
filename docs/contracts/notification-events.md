# Consumer notification types (G2)

Internal notification type identifiers for consumer projection. Authority: [ADR-031](../decisions/ADR-031-consumer-notification-contact-channel-and-delivery-policy.md).

These are **not** merchant webhook types and are **not** published on the Merchant API.

## Closed G2 catalogue

| Type | Trigger | Template |
| --- | --- | --- |
| `payment.action_required` | First workflow entry to `ACTION_REQUIRED` | `payment_action_required_v1` |
| `payment.failed` | Terminal `PaymentFailed` | `payment_failed_v1` |
| `payment.collected` | `PaymentCollected` | `payment_collected_v1` |

## Idempotency

```text
business_reference = notify:{notification_type}:{payment_workflow_public_id}
```

## Not in G2

- `bill.accepted`
- `bill.due_reminder.*`
- `settlement.*`
- per-attempt decline notifications
