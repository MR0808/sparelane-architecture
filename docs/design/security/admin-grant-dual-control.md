---
id: SEQ-SEC-006
title: Admin Grant Dual Control
type: sequence
area: security
status: accepted
mvp: true
likec4: []
requirements:
  - FUN-ADM-005
  - FUN-ADM-006
  - NFR-SEC-009
  - NFR-SEC-010
adrs:
  - ADR-012
  - ADR-032
  - ADR-033
tests:
  - ADM-PRIV-001
  - ADM-PRIV-002
  - ADM-DUAL-001
  - ADM-GRANT-001
  - ADM-GRANT-002
  - ADM-GRANT-003
---

# Admin Grant Dual Control (H1 Option A)

## Purpose

Platform admin **grant create/revoke** under dual control and recent MFA: request → approve → execute, with durable audit.

**H0 reads unchanged:** see [SEQ-SEC-005](./admin-read-only-control-plane.md) and [ADR-032](../../decisions/ADR-032-platform-admin-authority-read-only-control-plane.md) — inspection paths are not altered by this sequence.

Generic privileged-action sketch: [SEQ-SEC-004](./admin-privileged-action.md). This sequence is the **binding** H1 grant path ([ADR-033](../../decisions/ADR-033-privileged-admin-grant-management-and-approval.md)).

## Preconditions

- Requester and approver each have active `PlatformAdminGrant` and capability `admin.grant.manage`
- Target User addressed by mandatory `usr_…` public ID
- `PrivilegedAuthenticationContext` can supply `mfaSatisfiedAt` within 15 minutes for each privileged step (provider per OD-023/OD-024)
- Not a self-grant; last-active-admin rules enforceable at request and execute

## Mermaid

```mermaid
sequenceDiagram
    autonumber
    participant Req as Requester Admin
    participant Appr as Approver Admin
    participant Portal as Admin Portal (/admin)
    participant BFF as Admin BFF (/admin/v1)
    participant Id as Identity / MFA Context
    participant Priv as PrivilegedActionRequest Store
    participant Grant as PlatformAdminGrant
    participant Aud as Audit Service

    Req->>Portal: Request grant create/revoke (usr_…, reason)
    Portal->>BFF: POST privileged-action-request
    BFF->>Id: Resolve AdminPrincipal + PrivilegedAuthenticationContext
    alt MFA stale or missing (gt 15 min) or no capability
        BFF->>Aud: Audit deny/fail
        BFF-->>Portal: 401/403
    else recent MFA OK
        BFF->>BFF: Validate reason, usr_…, self-grant / last-admin prechecks
        BFF->>Priv: Create pending request + fingerprint
        BFF->>Aud: Audit request.create
        BFF-->>Portal: pending request
    end

    Appr->>Portal: Approve request
    Portal->>BFF: POST approve
    BFF->>Id: Recent MFA check (approver)
    alt approver is requester OR MFA stale OR fingerprint mismatch OR expired
        BFF->>Aud: Audit deny
        BFF-->>Portal: 403 / 409
    else eligible approver
        BFF->>Priv: Record approval → approved
        BFF->>Aud: Audit approve
        BFF-->>Portal: approved
    end

    Note over Req,Appr: Execute may be requester or another eligible admin

    Req->>Portal: Execute approved request
    Portal->>BFF: POST execute
    BFF->>Id: Recent MFA check (executor)
    alt MFA stale OR not approved OR already executed OR last-admin violate
        BFF->>Aud: Audit fail/deny
        BFF-->>Portal: 403 / 409
    else apply once
        BFF->>Grant: Create active grant OR set revoked
        BFF->>Priv: Mark executed (idempotent)
        BFF->>Aud: Audit execute success
        BFF-->>Portal: executed
    end
```

## Important invariants

- Closed actions only: `admin.grant.create`, `admin.grant.revoke`.
- Dual control: requester ≠ approver; both active platform admins; one approval; 24h expiry; fingerprint immutability.
- Recent MFA (≤15 minutes) on request, approve, and execute.
- Self-grant prohibited; self-approve prohibited; self-revoke only with other-admin approval and not last admin.
- Approved request executes **once**.
- H0 read-only control plane sequences and capabilities remain in force for GET inspection.

## Failure notes

- Failed MFA / capability / dual-control rule → reject step; durable deny/fail audit.
- Expiry → terminal `expired`; no execute.
- Last-admin revoke → reject at validation and execute.

## Related

[ADR-033](../../decisions/ADR-033-privileged-admin-grant-management-and-approval.md). LikeC4 dynamic view may track `adminGrantDualControl` when modelled.
