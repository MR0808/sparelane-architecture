# Merchant Webhooks

External asynchronous contract for merchant lifecycle outcomes.

**Binding:** [ADR-030](../decisions/ADR-030-merchant-webhook-contract-signing-and-delivery.md), [ADR-009](../decisions/ADR-009-signed-at-least-once-webhooks.md), [ADR-023](../decisions/ADR-023-curated-external-events.md).

Merchant webhooks are **not** a copy of the internal domain event bus.

Contracts: [webhook-envelope.md](../contracts/webhook-envelope.md), [webhook-events.md](../contracts/webhook-events.md), [webhook-signing.md](../contracts/webhook-signing.md).

## MVP event types

```text
bill.accepted
payment.action_required
payment.collected
payment.failed
settlement.submitted
settlement.settled
settlement.failed
```

Unsupported internal events are not exposed.

## Delivery model

```text
Domain Event
→ ProjectMerchantWebhook
→ WebhookEvent (evt_)
→ WebhookDelivery per ACTIVE subscribed endpoint
→ DeliverMerchantWebhook (HTTP outside DB TX)
→ signed payload
→ Merchant endpoint
```

Tracking:

- event ID (stable across retries)
- endpoint
- logical delivery
- attempt number (starts at 1, append-only)
- status / HTTP status / error class
- next retry
- final delivery state

Do not store merchant response bodies.

## Signing

HMAC-SHA256 over `"{unix_seconds}.{rawBody}"`. Headers and verify steps: [webhook-signing.md](../contracts/webhook-signing.md).

Secret: shown once (`whsec_` + Base64); stored recoverably via `signing_secret_ref`. Rotation deferred from G0/G1.

## At-least-once delivery

```text
webhooks are at-least-once delivery
```

Merchants **must** treat envelope `id` idempotently. Retries keep the same event ID and the same body (`createdAt` unchanged). Signature timestamp is fresh per attempt.

## Success

HTTP **200–299**. Response body ignored (bounded read). Does not prove merchant processing success.

## Retry (OD-031)

Independent of payment retry.

Retryable: timeout, connect failure, 408, 425, 429, 5xx.

Not retryable: other 4xx; SSRF abort; endpoint not ACTIVE.

Retry-After honoured on 429 and 503 only, capped at 6 hours.

Schedule after failed attempts 1–4: **1 minute, 5 minutes, 30 minutes, 6 hours**. Fifth failure exhausts.

## Exhaustion

Logical delivery `FAILED`. Endpoint is **not** auto-disabled. Financial state unchanged. Operator HTTP replay UI is Phase H.

## Endpoints

Merchant-owned. Statuses: `ACTIVE` | `DISABLED` | `REVOKED`. No verification challenge in MVP. URL/SSRF: ADR-030.

`event_types[]` empty = all MVP types; otherwise allowlist.

## Inbound provider webhooks

Separate: [webhook-security.md](../security/webhook-security.md). Provider → Sparelane uses provider auth, not this HMAC.
