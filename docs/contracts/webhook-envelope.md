# Merchant Webhook Envelope

Curated external contract. **Not** a direct serialisation of internal domain events ([ADR-023](../decisions/ADR-023-curated-external-events.md)).

## Body (Proposed)

```json
{
  "id": "evt_01HXYZ...",
  "type": "payment.collected",
  "createdAt": "2026-09-01T10:15:30.000Z",
  "merchantId": "mrc_...",
  "data": {}
}
```

`id` is stable across delivery retries. Merchants must process event IDs idempotently (at-least-once delivery).

## Headers (Proposed)

```text
Sparelane-Signature: <hex/base64 HMAC digest>
Sparelane-Timestamp: <unix seconds>
Sparelane-Event-Id: evt_...
```

Verification protects tampering, spoofing and replay outside the accepted timestamp window. HMAC-SHA256 proposed; algorithm package TBD if partners require otherwise.

Signing secret stored via secrets manager reference — not logged.
