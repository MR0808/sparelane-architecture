# Merchant Webhook Envelope

**Binding:** [ADR-030](../decisions/ADR-030-merchant-webhook-contract-signing-and-delivery.md). Curated external contract — **not** a serialisation of internal domain events ([ADR-023](../decisions/ADR-023-curated-external-events.md)).

Signing: [webhook-signing.md](./webhook-signing.md). Event `data`: [webhook-events.md](./webhook-events.md).

## Body

UTF-8 JSON. Compact (no insignificant whitespace). Key order **exactly** as below.

```json
{
  "id": "evt_01HXYZ...",
  "type": "payment.collected",
  "version": 1,
  "createdAt": "2026-09-01T10:15:30.000Z",
  "livemode": false,
  "merchantId": "mrc_...",
  "data": {}
}
```

| Field | Type | Rule |
| --- | --- | --- |
| `id` | string | Public `evt_…`. Stable across retries and across endpoints for the same logical event. Merchants must process this id idempotently. |
| `type` | string | Closed catalogue value |
| `version` | integer | Schema version of `type`. MVP = `1`. Breaking `data` change increments `version`. |
| `createdAt` | string | RFC3339 UTC with milliseconds. Original projection time; unchanged on retry. |
| `livemode` | boolean | `true` only when the **delivering endpoint** environment is LIVE |
| `merchantId` | string | Public `mrc_…` |
| `data` | object | Type-specific; public identifiers only |

Do not add `correlationId` or internal UUIDs.

## Headers

```text
Sparelane-Event-Id: evt_...
Sparelane-Event-Type: payment.collected
Sparelane-Timestamp: 1755840000
Sparelane-Signature: <lowercase hex HMAC-SHA256>
```

## Versioning vs Merchant API

Merchant HTTP API uses URI `/v1` ([ADR-022](../decisions/ADR-022-versioned-external-contracts.md)). Webhook `version` versions **this event type’s `data`**, not the API major.
