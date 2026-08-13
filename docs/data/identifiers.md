# Data Identifiers and References

Builds on [`docs/integrations/merchant-identifiers.md`](../integrations/merchant-identifiers.md).

Exact formats (UUID vs opaque token) remain TBD unless decided elsewhere.

## Internal database identity

Implementation-specific primary keys.

Should generally **not** leak into external merchant/consumer contracts.

## Public Sparelane identifiers

Stable references safe to expose externally when authorised.

Conceptual examples:

- Consumer ID (where appropriate)
- Connection ID (`sparelaneConnectionId`)
- Bill ID (`sparelaneBillId`)
- Payment Workflow ID
- Settlement ID
- Webhook Event ID

## Merchant-provided identifiers

Preserved for correlation and reconciliation:

- `merchantCustomerReference`
- `merchantBillReference` / invoice reference
- `merchantReconciliationReference`

## Provider identifiers

Mirrored for orchestration and reconciliation; provider remains authoritative:

- payment token reference
- PSP transaction ID
- settlement provider / instruction reference

## Authorisation rule

**Identifiers must not be treated as authorisation.**

Possession of an ID does not grant access. Every read/write requires authenticated actor + authorisation (tenant/ownership/scope checks).
