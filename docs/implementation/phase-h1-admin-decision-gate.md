# Phase H1 — Admin grant management decision gate (architecture)

**Status:** PASS — binding policy in [ADR-033](../decisions/ADR-033-privileged-admin-grant-management-and-approval.md)

**Scope chosen:** Option A — Admin Grant Management Only.

Platform H0 (read-only admin control plane) is PASS per [ADR-032](../decisions/ADR-032-platform-admin-authority-read-only-control-plane.md). H1 was blocked because privileged mutation catalogue, grant rules, MFA/re-auth, dual control, and related ops policies were unbound.

This gate **PASSes** for grant management only. Canonical **Phase H** is **not** complete.

## Hard gate result

| # | Gate area | Result |
| --- | --- | --- |
| 1 | Privileged mutation catalogue | **Resolved** — closed enum: `admin.grant.create`, `admin.grant.revoke` only ([ADR-033](../decisions/ADR-033-privileged-admin-grant-management-and-approval.md)) |
| 2 | Admin grant-management rules | **Resolved** — create/revoke; `usr_…` targeting; self-grant prohibited; self-approve prohibited; self-revoke with dual control + not last admin; last-active-admin protection; bootstrap runbook (no `ENV_ADMIN_EMAIL`) |
| 3 | Mandatory reason / justification | **Resolved** — required on PrivilegedActionRequest; 16–500 chars; no secrets/PII dumps |
| 4 | OD-024 MFA / re-auth | **Resolved (policy)** — recent MFA ≤15 min for request/approve/execute via `PrivilegedAuthenticationContext`; **provider still open** (OD-023/OD-024) — production admin MFA remains blocked |
| 5 | OD-026 dual-control matrix | **Resolved (grants only — Option B)** — requester≠approver; both active `platform_admin`; one approval; 24h expiry; fingerprint immutability; break-glass NOT SUPPORTED |
| 6 | Durable DLQ / operator persistence | **Deferred** — non-blocking for H1 Option A |
| 7 | DLQ replay semantics | **Deferred** — non-blocking for H1 Option A |
| 8 | Webhook replay semantics | **Deferred** — non-blocking for H1 Option A |
| 9 | Replay identity / idempotency | **Deferred** for replay; **Resolved** for grant PrivilegedActionRequest execute-once idempotency |
| 10 | Financial-event stronger replay controls | **Deferred** — non-blocking for H1 Option A |
| 11 | PII / support lookup policy | **Deferred** — non-blocking for H1 Option A |
| 12 | Financial correction policy | **Deferred** — non-blocking for H1 Option A |
| 13 | Break-glass decision | **Resolved** — **NOT SUPPORTED** |
| 14 | Impersonation decision | **Resolved** — **NOT SUPPORTED** |
| 15 | Audit requirements for privileged actions | **Resolved** — mandatory audit fields for request/approve/deny/execute/fail ([ADR-033](../decisions/ADR-033-privileged-admin-grant-management-and-approval.md), ADR-012) |

## Scope options evaluated

| Option | Verdict |
| --- | --- |
| **A — Admin grant management only** | **Selected for H1** |
| B — Grants + merchant/user lifecycle | Rejected — suspend/disable unbound |
| C — Full privileged ops + replay | Rejected — DLQ/replay/financial/PII unbound |

## H1 Option A principle

> H1 Option A proves **how** platform admins may **create and revoke** `PlatformAdminGrant` under dual control and recent MFA.
> It does **not** prove merchant/user lifecycle, replay, corrections, or support PII workflows.

## Platform H1 may implement (grant management only)

1. `PrivilegedActionRequest` + `PrivilegedActionApproval` persistence and state machine per ADR-033
2. Capability `admin.grant.manage` on grant request/approve/execute routes
3. Admin BFF `POST /admin/v1/…` endpoints for request / approve / deny / execute — session only
4. Grant lifecycle `active` \| `revoked`; authority still `ExternalIdentity → User → active grant → AdminPrincipal`
5. Target User by mandatory `usr_…` public ID
6. Recent MFA checks via `PrivilegedAuthenticationContext` (max 15 minutes) on request/approve/execute
7. Dual-control enforcement (requester ≠ approver; 24h expiry; fingerprint immutability)
8. Self-grant / self-approve / last-admin protections
9. Durable audit for privileged grant steps
10. Tests per ADM-PRIV / ADM-DUAL / ADM-GRANT specs
11. Bootstrap runbook documentation (ops) — no `ENV_ADMIN_EMAIL`

## Must not invent (H1 Option A)

- merchant suspend/unsuspend
- user disable/enable
- DLQ durable store, DLQ UI, or any replay (DLQ/webhook/notification/financial)
- financial corrections / ledger admin mutations
- PII/email/support search
- break-glass or impersonation
- support/risk/finance admin roles
- audit export / SIEM
- single-actor grant mutation APIs
- environment-variable admin bootstrap

## Engineering decomposition

| Slice | Scope |
| --- | --- |
| **H0** | Read-only admin control plane (PASS — ADR-032) |
| **H1 Option A** | Privileged grant create/revoke + dual control + recent MFA + reason |
| **H2+** | Replay, durable DLQ, suspend/disable, corrections, PII/support, roles, export — separately gated |

Canonical **Phase H** is **not** complete after H1 Option A.

## Still TBD (not H1 Option A blockers)

- [OD-023](../decisions/open/OD-023-identity-provider.md) / [OD-024](../decisions/open/OD-024-mfa-passkey.md) — IdP MFA provider (blocks **production** admin deployment)
- Durable DLQ / replay / webhook replay policy
- Merchant suspend / user disable catalogue
- Financial correction workflows
- PII/support lookup policy
- Support/risk/finance role matrix
- Audit export / SIEM
- Dual-control matrices for non-grant actions (OD-026 residual)

## Requirements & tests bound

- FUN-ADM-005, FUN-ADM-006
- NFR-SEC-009, NFR-SEC-010
- ADM-PRIV-001, ADM-PRIV-002, ADM-DUAL-001, ADM-GRANT-001, ADM-GRANT-002, ADM-GRANT-003
- Design: [SEQ-SEC-006](../design/security/admin-grant-dual-control.md)

## Production safety review (ADR-033 prevents)

| Risk | H1 Option A policy |
| --- | --- |
| Single-actor grant change | Forbidden |
| Self-grant / self-approve | Forbidden |
| Last admin lockout | Forbidden |
| ENV/email admin | Forbidden |
| Stale MFA on privileged steps | Forbidden (15 min) |
| Break-glass / impersonation | NOT SUPPORTED |
| Replay / suspend / PII via this gate | Deferred — out of scope |

## Exit criterion

**H1 ADMIN DECISION GATE: PASS** (Option A — grant management only)

Platform may begin **grant-management** implementation without inventing broader privileged-ops policy. Canonical Phase H remains incomplete.
