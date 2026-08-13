# ADR-009 — Signed At-Least-Once Webhooks

## Status

Accepted

## Context

Merchants need asynchronous notification of bill acceptance, payment outcomes and settlement status. Networks fail, merchant endpoints are intermittently unavailable, and Sparelane must not lose merchant-visible lifecycle communication.

## Decision

Merchant webhooks use:

- signed payloads
- at-least-once delivery
- stable event identifiers across retries
- merchant-side idempotent processing

Webhook retries redeliver the same event ID and do not create new domain events.

Internal domain events are curated into an external webhook contract; they are not exposed wholesale.

## Consequences

### Positive

- reliable merchant notification despite transient failures
- authenticity/integrity via signatures
- replay protection with timestamp + signature verification
- clear merchant responsibility for idempotent handling

### Negative / tradeoffs

- merchants must implement idempotent consumers
- delivery/retry operations add platform complexity
- duplicate deliveries are expected and must be harmless
- signing secret management and rotation required

## Alternatives Considered

1. **Polling only** — insufficient for timely operational updates; may remain complementary.
2. **Exactly-once webhook delivery** — not generally achievable; rejected as hard guarantee.
3. **Unsigned webhooks** — rejected due to spoofing/tampering risk.
4. **Expose raw internal event bus to merchants** — rejected; couples merchants to internal model churn.
