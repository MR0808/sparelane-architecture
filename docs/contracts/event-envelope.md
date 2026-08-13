# Internal Event Envelope

Canonical envelope for internal domain events (Event Bus / outbox). **Proposed** field names.

```json
{
  "id": "evt_01HXYZ...",
  "type": "payment.collected",
  "version": 1,
  "occurredAt": "2026-09-01T10:15:30.000Z",
  "correlationId": "req_...",
  "causationId": "evt_...",
  "aggregate": {
    "type": "paymentWorkflow",
    "id": "pay_..."
  },
  "data": {}
}
```

## Rules

- `id` unique; at-least-once delivery may redeliver the same id
- `version` is the **payload schema version** for `type`
- compatible additive changes may keep the same major `version` with documented rules; breaking payload changes bump `version` or `type`
- `data` is typed per `type` — not an arbitrary blob dump
- consumers must be idempotent on `id` and/or aggregate+business keys
- merchant webhooks are **not** this envelope serialised — see curated webhook contracts
