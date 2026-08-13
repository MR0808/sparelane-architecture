# Logical Data Stores

Responsibilities of Sparelane logical stores. Physical topology (same cluster vs separate databases) remains TBD.

## Operational Database

Authoritative **operational application state**.

Examples:

- consumers, merchants, merchant users (application projections)
- merchant connections
- bills (Sparelane-received)
- payment workflows and attempts
- integration metadata, webhook endpoints/events/delivery attempts
- payment method token references and priority
- reconciliation operational records

**Not** authoritative for financial journal balances.

Must not store raw PAN/CVV or plaintext API secrets after issuance.

## Financial Ledger Database

Authoritative for:

- journal transactions
- journal entries
- financial references linking to payments/settlements
- settlement financial records where appropriate

Highly restricted. Append-only journal semantics. No direct admin UI mutation.

## Audit Store

Durable security/administrative history.

Must not contain secrets, raw payment credentials, PAN or CVV.

## Analytics Store

Derived / non-operational.

Used for merchant reporting and future reliability intelligence inputs.

**Must not become authoritative for application decisions.**

```text
analytics outage must not stop payment correctness
```

unless a future predictive feature explicitly requires it (and is designed with fallback — currently FUTURE).

Technology/warehouse vendor TBD.

## Secure Object Storage

May contain:

- merchant verification documents / KYC–KYB evidence
- generated reports/exports

Access-restricted. Never store raw card credentials.

Vendor TBD.
