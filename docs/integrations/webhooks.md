# Merchant Webhooks

External asynchronous contract for merchant lifecycle outcomes.

Merchant webhooks are **not** a copy of the internal domain event bus. Merchant Webhook Delivery selects and shapes merchant-facing events.

## Conceptual event categories

Proposed conceptual names (not final API names):

```text
bill.accepted
payment.preauthorised
payment.action_required
payment.collected
payment.failed
settlement.processing
settlement.settled
settlement.failed
```

Avoid exposing every internal domain event.

## Delivery model

```text
Domain Event
→ Merchant Webhook Delivery
→ signed payload
→ Merchant endpoint
```

Delivery tracking conceptually includes:

- event ID (stable across retries)
- endpoint
- attempt number
- status
- response code
- timestamps
- next retry
- final delivery state

Do not store merchant response bodies unless a concrete operational need is demonstrated.

## Signing

Webhook payloads are signed so merchants can verify authenticity and integrity.

Conceptual signed request includes:

```text
timestamp
event identifier
signature
payload
```

**Proposed approach:** HMAC-SHA256 over a canonical string including timestamp and body, using a per-endpoint or per-merchant webhook secret.

Verification should protect against:

- payload tampering
- replay
- stale requests (timestamp skew window TBD)

Exact algorithm/header names remain proposed until API contract phase.

## At-least-once delivery

Unless a stronger guarantee is explicitly supported later:

```text
webhooks are at-least-once delivery
```

Therefore merchants **must** treat webhook event IDs idempotently.

Repeated delivery must not cause repeated business side effects.

See [ADR-009](../decisions/ADR-009-signed-at-least-once-webhooks.md).

## Retry behaviour

### Successful acknowledgement

HTTP 2xx.

### Retryable delivery failure

Examples:

- timeout
- 429
- temporary 5xx

### Terminal / configuration failure

Examples:

- endpoint removed
- persistent authentication/configuration failure

Principles:

- exponential/backoff style strategy
- bounded attempts
- retry observability
- manual replay for authorised operators
- **same event ID** across delivery attempts
- retries do **not** create new domain events

Exact retry schedule is TBD.
