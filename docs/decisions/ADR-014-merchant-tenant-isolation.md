# ADR-014 — Merchant Tenant Isolation Is Mandatory

## Status

Accepted

## Context

Sparelane is multi-merchant. Bills, connections, settlements, webhook endpoints and API credentials are merchant-scoped. Cross-tenant leakage is a critical confidentiality and integrity risk.

## Decision

All merchant-scoped application data and operations require explicit tenant (merchant) context and authorisation.

Includes portal users, API credentials, webhook configuration, settlements and reporting.

Database-level RLS may be added later as defence-in-depth; **RLS vs application-only enforcement is not decided** in this ADR.

## Consequences

### Positive

- reduces cross-merchant data leakage risk
- clarifies API credential and portal authorisation design
- sets testing expectations (positive, negative, IDOR-style)

### Negative / tradeoffs

- every query path must carry tenant context
- admin cross-tenant tooling needs exceptional audited controls
- enforcement bugs remain a residual risk requiring tests

## Alternatives Considered

1. **Shared pools without tenant filters** — rejected.
2. **Mandate PostgreSQL RLS immediately** — deferred; useful option, not yet selected.
