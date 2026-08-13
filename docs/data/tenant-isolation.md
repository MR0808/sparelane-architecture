# Merchant Tenant Isolation

All merchant-scoped application data and operations require explicit merchant (tenant) context and authorisation.

## Requirements

- all merchant-owned data must resolve to an explicit merchant context
- merchant users may only access authorised merchant contexts
- API credentials resolve to a merchant context and scopes
- queries and mutations must enforce tenant filtering
- webhook endpoints belong to a merchant context
- settlements belong to a merchant context
- cross-merchant references must not be accepted blindly
- admin cross-tenant access is exceptional and audited

## Enforcement approach

Application-level tenant enforcement is mandatory in the logical architecture.

Database-level row-level security (RLS) may be an **additional** control. RLS vs application-only enforcement is **not decided** yet.

## Testing expectations (conceptual)

- positive tenant access tests
- negative cross-tenant access tests
- identifier substitution / IDOR-style tests (swap merchant or resource IDs)

See [ADR-014](../decisions/ADR-014-merchant-tenant-isolation.md).
