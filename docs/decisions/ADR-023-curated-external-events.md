# ADR-023 — External Events Are Curated Contracts

## Status

Accepted

## Context

Internal domain events exist for asynchronous coordination and will change with Sparelane internals. Merchants need a stable notification contract.

## Decision

Merchant webhook events are **curated external contracts** and are **not** direct serialisations of internal domain events.

Internal envelopes and merchant webhook envelopes remain separate. Event selection, shaping and versioning are an explicit integration responsibility (Merchant Webhook Delivery).

## Consequences

### Positive

- merchants insulated from internal model churn
- security/privacy control over exported fields
- clearer compatibility guarantees

### Negative / tradeoffs

- mapping layer from domain events → webhook types
- dual schema maintenance (internal + external)
