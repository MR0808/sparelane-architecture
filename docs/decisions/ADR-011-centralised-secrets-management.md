# ADR-011 — Centralised Secrets Management

## Status

Accepted

## Context

Sparelane requires production credentials for PSP, banking/settlement, KYC/KYB, email/SMS, webhook signing, API cryptography and databases. Storing these in source control or unstructured config files creates leak and rotation risk.

## Decision

Production secrets are managed through a central managed secrets capability rather than source code or plain config files.

Principles:

- no secrets in source control
- least-privilege access
- environment separation
- rotation capability
- audit of access where supported
- no secret values in application logs

**Vendor TBD.**

## Consequences

### Positive

- reduces accidental secret disclosure
- supports rotation and environment isolation
- clearer operational ownership of credentials

### Negative / tradeoffs

- runtime dependency on secrets availability
- engineering discipline required for local/dev secret handling
- vendor selection and cost still open

## Alternatives Considered

1. **Environment variables only in hosting UI** — insufficient alone for rotation, audit and scale.
2. **Encrypted secrets in git** — rejected as primary production pattern due to key-distribution and leak risk.
