---
id: SEQ-SEC-005
title: Admin Read-Only Control Plane
type: sequence
area: security
status: accepted
mvp: true
likec4: []
requirements:
  - FUN-ADM-001
  - FUN-ADM-002
  - FUN-ADM-003
  - FUN-ADM-004
  - NFR-SEC-008
  - NFR-PRIV-005
adrs:
  - ADR-032
tests:
  - ADM-AUTH-001
  - ADM-AUTH-002
  - ADM-DATA-001
  - ADM-FIN-001
---

# Admin Read-Only Control Plane (H0)

## Purpose

H0 admin inspection: persisted platform-admin authority, server-side guard, safe read-only lookups — **no privileged mutations**, no DLQ replay, no grant management.

## Preconditions

- User with active `PlatformAdminGrant`
- Dev/test or future production IdP session (MFA production requirement tracked in OD-024)

## Mermaid

```mermaid
sequenceDiagram
    autonumber
    participant Admin as Sparelane Admin
    participant Portal as Admin Portal (/admin)
    participant BFF as Admin BFF (/admin/v1)
    participant Id as Identity Service
    participant Read as Admin Read Ports
    participant Aud as Audit Service
    participant Ops as Operational Sources

    Admin->>Portal: Open admin home / lookup
    Portal->>BFF: GET read request (session cookie)
    BFF->>Id: Authenticate + resolve PlatformAdminGrant
    alt not platform admin
        BFF-->>Portal: 403 + security event
    else platform admin
        BFF->>BFF: Check closed read capability
        BFF->>Read: Exact public-ID query / snapshot
        Read->>Ops: Safe projection (no raw DB browser)
        BFF-->>Portal: Redacted JSON (no secrets)
    end

    Admin->>Portal: Open audit view
    Portal->>BFF: GET /admin/v1/audit
    BFF->>Aud: Paginated read-only query
    Aud-->>BFF: Append-only records (redacted)
    BFF-->>Portal: Safe audit page
```

## Important invariants

- Persisted grant is sole admin authority — not merchant role, not env config.
- Deny-by-default capability checks — no wildcard.
- No mutation paths in H0 — privileged action sequence (SEQ-SEC-004) applies to **H1+**.
- No direct ledger edit — ADR-012/013 unchanged.
- Cross-tenant reads via admin read ports — not merchant context spoofing.

## Failure notes

- Anonymous → 401; authenticated non-admin → 403 + `security.authorisation_denied` per existing policy.
- Routine read success is **not** individually audited in H0.

## Related

LikeC4 dynamic view `adminReadOnlyControlPlane`. [ADR-032](../../decisions/ADR-032-platform-admin-authority-read-only-control-plane.md).
