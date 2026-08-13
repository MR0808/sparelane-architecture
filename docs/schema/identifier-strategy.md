# Identifier Strategy

Physical and public identifier conventions for Sparelane.

## Internal IDs

**Recommended:** UUID primary keys, preferably **UUIDv7** (time-sortable) for Operational DB and Ledger DB tables.

Rationale:

- globally unique without central sequence
- efficient enough for PostgreSQL
- time-ordered inserts reduce index churn vs random UUIDv4

Exact PostgreSQL type (`uuid` vs `bytea`) and generation library are **TBD**; treat UUIDv7 as the proposed default.

Internal IDs **must not** be exposed on Merchant API or merchant webhooks.

## Public IDs

Stable opaque identifiers for external contracts.

**Proposed** prefix format (mark Proposed until product finalises):

| Prefix | Entity |
| --- | --- |
| `mrc_` | Merchant |
| `con_` | Consumer (where exposed) |
| `conn_` | Merchant Connection |
| `pm_` | Payment Method (where exposed) |
| `bill_` | Bill |
| `pay_` | Payment Workflow (merchant-facing "payment") |
| `patt_` | Payment Attempt (internal/support; not MVP merchant API) |
| `set_` | Settlement |
| `sbatch_` | Settlement Batch |
| `sinstr_` | Settlement Instruction |
| `evt_` | Webhook Event / Event ID |
| `wh_` | Webhook Endpoint |
| `key_` | API Credential (public key id / prefix only) |
| `jt_` | Journal Transaction (internal/ops; not merchant API) |

Public IDs:

- are opaque (no sequential integers)
- are stable once issued
- map 1:1 to an internal row via unique index
- **are not authorisation** — possession of an ID does not grant access

## Merchant identifiers

Stored separately and preserved for correlation:

- `merchant_customer_reference`
- `merchant_bill_reference`
- `merchant_reconciliation_reference`

Never overload Sparelane public IDs with merchant references.

## Provider identifiers

Stored exactly as received, with provider context:

- `provider` / `provider_code`
- `provider_token_ref` / `provider_transaction_id` / `provider_event_id` / `provider_instruction_ref`

Provider remains authoritative for provider-side execution and CHD.

## Rule

```text
IDs are not authorisation.
```

Every access requires authenticated actor + tenant/ownership checks.
