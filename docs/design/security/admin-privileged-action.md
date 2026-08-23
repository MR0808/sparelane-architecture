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

Privileged admin **mutations** require MFA/session validation, explicit authorisation, and durable audit. Admin must not edit the ledger directly through UI.

**H0 (read-only):** see [SEQ-SEC-005](./admin-read-only-control-plane.md) and [ADR-032](../../decisions/ADR-032-platform-admin-authority-read-only-control-plane.md) — no privileged mutations in H0.

**H1 (grant management only):** SEQ-SEC-004 remains the **general** privileged-mutation pattern. The binding H1 grant create/revoke flow is **[SEQ-SEC-006](./admin-grant-dual-control.md)** ([ADR-033](../../decisions/ADR-033-privileged-admin-grant-management-and-approval.md)). **No financial mutations, replay, or corrections in H1.**

## Preconditions

- Admin user with privileged role / capability.
- MFA challenge satisfiable for the action class (H1: recent MFA ≤15 min).

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
- H1 Option A: grant actions only via dual-control PrivilegedActionRequest (SEQ-SEC-006) — not this generic single-step path for grants.

## Failure notes

- Failed MFA or permission → reject; still audit deny where policy requires.
- Dual-control for grants bound by ADR-033; break-glass NOT SUPPORTED; other dual-control matrices deferred H2+.

## Related

LikeC4 dynamic view `adminPrivilegedAction`. ADR-011 / ADR-012. H1 grants: SEQ-SEC-006 / ADR-033.
