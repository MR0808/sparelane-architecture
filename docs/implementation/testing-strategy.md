# Testing Strategy

## Unit

- state transitions (workflow, attempt, settlement)
- method selection / decline classification
- money maths (minor units)
- ledger balancing validation
- idempotency fingerprint conflicts

## Module / integration

- bill idempotency
- workflow creation (1:1 bill)
- ledger posting uniqueness
- settlement creation gating on ledger confirmation
- tenant isolation queries

## Contract

- OpenAPI request/response conformance
- webhook envelope/event schemas and HMAC signing string (ADR-030)
- provider adapter contract fakes

## End-to-end (critical flows)

- primary success
- backup recovery
- complete failure
- scheduled retry
- collection → ledger
- settlement success / failure / unknown outcome
- duplicate bill submission
- webhook retry
- webhook SSRF denylist
- HMAC exact-bytes signing
- consumer notification contact boundary (auth email not used)
- consumer notification idempotency and SKIPPED/no-destination
- Fake email provider nonProductionOnly

## Security

- cross-merchant isolation / IDOR
- auth scopes
- replay attacks (webhooks, idempotency)
- signature failures
- privilege checks for admin
