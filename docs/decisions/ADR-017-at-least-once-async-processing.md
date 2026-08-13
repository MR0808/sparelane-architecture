# ADR-017 — At-Least-Once Async Processing

## Status

Accepted

## Context

Queues, outbox publication, workers and webhooks cannot reliably provide end-to-end exactly-once semantics across Sparelane and external providers.

## Decision

Internal asynchronous work assumes **at-least-once delivery** and requires **idempotent consumers**, rather than relying on exactly-once infrastructure guarantees.

## Consequences

### Positive

- realistic failure model
- safe retries and DLQ replay when designed correctly
- vendor-neutral (works across common brokers)

### Negative / tradeoffs

- every financially sensitive consumer needs idempotency keys/state checks
- duplicate deliveries are expected and must be harmless
- operators must not blind-replay financial side effects

## Alternatives Considered

1. **Exactly-once broker features as sole control** — rejected as insufficient across DB, workers and external APIs.
