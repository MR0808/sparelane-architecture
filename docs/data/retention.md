# Data Lifecycle and Retention

Do **not** invent legal retention periods. Categories and rationale only. Exact durations: **TBD** pending legal/compliance validation.

Distinguish:

```text
retention policy   ≠   backup retention
```

Backup/archive copies may outlive application retention and need separate policy (**TBD**).

## Account / profile data

Retention based on business need and applicable obligations. **TBD.**

## Payment operational records

Must support customer support, dispute investigation, reconciliation and audit. Exact period **TBD.**

## Financial ledger

Financial history must maintain integrity. Deletion must not destroy balanced accounting history.

Privacy handling may require de-identification/pseudonymisation rather than deletion of journal records. Final treatment **TBD.**

## Audit records

Long-lived where justified. Exact retention **TBD.**

## Webhook delivery records

Operational retention. Exact period **TBD.**

## Consumer notification delivery records

Operational retention for `consumer_notifications` and delivery attempts. Contact email values must be minimised/anonymised on consumer deletion per privacy policy. Exact period **TBD** ([OD-014](../decisions/open/OD-014-legal-retention.md)).

## Analytics

Separate retention/minimisation policy from transactional stores. **TBD.**

## Verification evidence (KYC/KYB)

Depends on provider and regulatory obligations. **TBD.**
