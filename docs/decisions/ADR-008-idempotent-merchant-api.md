# ADR-008 — Idempotent Merchant API Mutations

## Status

Accepted

## Context

Merchant networks are unreliable. Clients time out, retry, and replay requests. Bill submission and other mutation APIs can create payment workflows with financial consequences if duplicated.

## Decision

Merchant API operations capable of creating payment/financial consequences must support safe idempotent retries.

Especially bill submission:

- merchants may supply an idempotency key / stable request identity
- Sparelane detects duplicate submissions and returns the existing result
- conflicting reuse of the same key with a different payload is rejected as an idempotency conflict

## Consequences

### Positive

- safe recovery from network uncertainty
- prevents duplicate payment workflows
- clearer merchant integration behaviour
- supports at-least-once client retry patterns

### Negative / tradeoffs

- requires idempotency-key storage and retention policy (retention TBD)
- request fingerprint/conflict handling adds complexity
- merchants must understand acknowledgement vs collection semantics

## Alternatives Considered

1. **No idempotency; rely on merchant discipline** — rejected; real-world retries will create duplicates.
2. **Exactly-once network delivery** — not achievable over standard HTTPS; rejected as sole control.
