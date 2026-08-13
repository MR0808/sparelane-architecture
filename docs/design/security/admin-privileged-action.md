---
id: SEQ-SEC-004
title: Admin Privileged Action
type: sequence
area: security
status: accepted
mvp: true
likec4: []
requirements:
  - NFR-SEC-007
  - NFR-OPS-004
adrs:
  - ADR-011
  - ADR-012
  - ADR-013
tests:
  - SEC-AUTH-001
  - SEC-TEN-001
---

# Admin Privileged Action

## Purpose

Privileged admin actions require MFA/session validation, explicit authorisation, and durable audit. Admin must not edit the ledger directly through UI.

## Preconditions

- Admin user with privileged role.
- MFA challenge satisfiable for the action class.

## Mermaid

```mermaid
sequenceDiagram
    autonumber
    participant Admin as Sparelane Admin
    participant Portal as Admin Portal
    participant BFF as Admin BFF
    participant Id as Identity Service
    participant Authz as Authorization
    participant Dom as Merchant Service
    participant Aud as Audit Service
    participant ADB as Audit DB

    Admin->>Portal: Initiate privileged action
    Portal->>BFF: Submit privileged request
    BFF->>Id: Validate MFA + admin session
    BFF->>Authz: Check privileged permission
    BFF->>Dom: Perform authorised operation
    BFF->>Aud: Record durable audit event
    Aud->>ADB: Persist actor, action, target, result

    Note over BFF,ADB: No direct ledger edit via admin UI (ADR-012 / ADR-013)
```

## Important invariants

- MFA + authorisation before privileged mutation.
- Durable audit for actor/action/target/result.
- Ledger mutations only via Ledger Service domain paths — never raw admin writes.

## Failure notes

- Failed MFA or permission → reject; still audit deny where policy requires.
- Dual-control workflows remain TBD product-wise.

## Related

LikeC4 dynamic view `adminPrivilegedAction`. ADR-011 / ADR-012.
