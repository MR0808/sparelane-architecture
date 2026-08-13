---
id: SEQ-DATA-002
title: Consumer Deletion
type: sequence
area: data
status: accepted
mvp: true
likec4: []
requirements:
  - NFR-PRIV-001
  - NFR-PRIV-002
  - NFR-PRIV-003
  - NFR-PRIV-004
adrs:
  - ADR-012
  - ADR-013
tests:
  - SEC-AUTH-001
---

# Consumer Deletion

## Purpose

Authenticated deletion request: revoke access and payment methods, delete/anonymise eligible profile data, preserve required ledger and audit history. Financial journal entries are not deleted.

## Preconditions

- Verified consumer identity / deletion request.
- Retention rules classify eligible vs retained data.

## Mermaid

```mermaid
sequenceDiagram
    autonumber
    participant C as Consumer
    participant Web as Consumer Web
    participant BFF as Consumer BFF
    participant Id as Identity Service
    participant CS as Consumer Service
    participant PMS as Payment Method Service
    participant ODB as Operational DB
    participant LDB as Ledger DB
    participant Aud as Audit Service

    C->>Web: Request account deletion
    Web->>BFF: Verified deletion request
    BFF->>Id: Authenticate and verify
    BFF->>CS: Identify eligible vs retained data
    CS->>PMS: Revoke payment methods for new use
    CS->>ODB: Delete / anonymise eligible profile data
    CS->>LDB: Preserve required financial journal history
    CS->>Aud: Record deletion / anonymisation
    Note over LDB,Aud: Ledger + audit retained — not purged
```

## Important invariants

- Ledger and required audit history preserved.
- Payment methods revoked for future use.
- Eligible PII deleted or anonymised per NFR-PRIV-*.

## Failure notes

- Incomplete verification → no deletion.
- Never hard-delete required financial journals.

## Related

LikeC4 dynamic view `consumerDeletion`.
