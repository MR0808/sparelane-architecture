# Deletion and Anonymisation

Conceptual deletion categories. Final retention/deletion policy requires legal/compliance input.

## Hard deletion

Appropriate only where there is no continuing integrity, audit or financial requirement.

## Soft deletion / archival

Operational record no longer active but retained under retention policy.

## Anonymisation

Remove or irreversibly detach identifying information while retaining useful non-personal history.

## Pseudonymisation

Replace direct identifiers while preserving controlled linkage for authorised purposes.

## Privacy vs integrity conflict

```text
privacy deletion request
    ↔
financial / audit integrity
```

These goals can conflict. Sparelane must not destroy balanced ledger history or required audit evidence solely to satisfy an operational “delete everything” impulse.

State machine for consumer/merchant offboarding: delete or anonymise **eligible** profile/config data; **retain** protected financial and audit records appropriately.

Statutory requirements are **not** resolved in this repository.
