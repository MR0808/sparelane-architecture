# ADR-022 — Versioned External Contracts

## Status

Accepted

## Context

Merchants depend on stable HTTP APIs and webhooks. Unversioned breaking changes destroy integrations.

## Decision

Merchant API and external webhook contracts are **explicitly versioned** and evolve under backwards-compatibility rules.

- API: URI major version (`/v1`)
- Breaking changes require a new major version
- Additive optional fields are backwards compatible

## Consequences

### Positive

- predictable merchant upgrades
- parallel version support possible during migrations

### Negative / tradeoffs

- multiple versions may coexist temporarily
- discipline required in review process
