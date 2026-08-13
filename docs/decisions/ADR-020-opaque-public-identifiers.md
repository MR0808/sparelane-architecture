# ADR-020 — Opaque Public Identifiers

## Status

Accepted

## Context

Exposing sequential database identities or internal UUIDs directly couples merchants to storage details and can leak volume/ordering information.

## Decision

External API and webhook contracts use **stable opaque Sparelane public identifiers** distinct from physical database primary keys and from merchant/provider identifiers.

IDs are not authorisation.

### Proposed implementation (not locked by this ADR)

- Internal PKs: UUIDv7 (or equivalent time-sortable UUID)
- Public IDs: opaque strings, optionally with human-readable type prefixes (`bill_`, `pay_`, `conn_`, …)

Prefix spelling may change without superseding this ADR if opacity and stability are preserved.

## Consequences

### Positive

- stable external contracts
- freedom to change physical storage
- reduced information leakage from sequential IDs

### Negative / tradeoffs

- mapping layer between public and internal IDs
- prefix taxonomy must be maintained
