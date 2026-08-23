---
id: ADR-033
title: Privileged Admin Grant Management and Dual-Control Approval
status: Accepted
date: 2026-08-23
deciders: Architecture
consulted: Product / Security / Privacy / Operations
informed: Platform engineering
supersedes: []
related:
  - ADR-012
  - ADR-014
  - ADR-020
  - ADR-032
  - OD-023
  - OD-024
  - OD-026
---

# ADR-033 — Privileged Admin Grant Management and Dual-Control Approval

## Status

**Accepted**

Unblocks platform **H1 Option A** — admin grant management only — without inventing merchant suspend/disable, DLQ/webhook/notification/financial replay, PII/support search, financial corrections, break-glass, impersonation, ledger admin view, audit export/SIEM, or additional admin roles.

Platform H1 grant-management implementation was correctly **blocked** pending this gate. See [phase-h1-admin-decision-gate](../implementation/phase-h1-admin-decision-gate.md).

Canonical **Phase H** remains incomplete after this slice — H0 reads stand; broader privileged mutations and replay remain gated.

## Context

[ADR-032](./ADR-032-platform-admin-authority-read-only-control-plane.md) bound H0 as read-only inspection with persisted `PlatformAdminGrant` as the sole platform-admin authority. Grant CRUD, dual control, MFA/re-auth for mutations, and reason policy were deferred.

[phase-h1-decision-gate-scope](../implementation/phase-h1-decision-gate-scope.md) listed fifteen items that must be Accepted or explicitly deferred before privileged admin work. Implementing a broad H1 “ops portal” would invent security policy (full mutation catalogue, OD-024 provider, durable DLQ, financial correction).

**Chosen H1 scope — Option A:** Admin Grant Management Only.

| Option | Verdict |
| --- | --- |
| **A — Grant management only** | **Selected for H1** |
| B — Grants + merchant/user lifecycle mutations | Rejected — suspend/disable policy unbound |
| C — Full privileged ops + replay | Rejected — DLQ/replay/financial/PII policy unbound |

## Decision summary (binding for H1 Option A)

| # | Decision |
| --- | --- |
| 1 | **H1 scope:** admin grant create/revoke with dual control only — **no** other privileged business mutations |
| 2 | **Closed action catalogue:** exactly `admin.grant.create` and `admin.grant.revoke` |
| 3 | **Capability:** `admin.grant.manage` — required for request, approve, and execute of grant actions; deny-by-default |
| 4 | **Risk class:** both actions are **HIGH** |
| 5 | **Targeting:** grant create/revoke targets User by mandatory public ID `usr_…` only — no email, auth subject, or internal UUID in admin APIs |
| 6 | **Grant lifecycle status:** `active` \| `revoked` — only `active` confers `AdminPrincipal` |
| 7 | **Self-grant:** **prohibited** |
| 8 | **Self-approve:** **prohibited** |
| 9 | **Self-revoke:** allowed only if another active platform admin approves **and** the revoke is **not** of the last active admin |
| 10 | **Last-active-admin protection:** cannot revoke (or leave revoked) the sole remaining active `platform_admin` grant |
| 11 | **Dual control (OD-026 Option B — grants only):** requester ≠ approver; both active `platform_admin`; exactly one approval; 24h request expiry; fingerprint immutability |
| 12 | **Recent MFA:** request, approve, and execute each require recent MFA — max age **15 minutes** via `PrivilegedAuthenticationContext` |
| 13 | **OD-024:** MFA **policy** bound here; IdP/provider resolution remains open ([OD-023](./open/OD-023-identity-provider.md), [OD-024](./open/OD-024-mfa-passkey.md)) — production admin still blocked until provider MFA can satisfy this context |
| 14 | **PrivilegedActionRequest** workflow is mandatory for both grant actions — no single-actor grant mutation API |
| 15 | **Reason:** required on request; 16–500 chars; no secrets/PII dumps |
| 16 | **Idempotency:** an approved request executes **once**; re-execute of completed request is no-op success or conflict per execute semantics — never double-apply |
| 17 | **Bootstrap:** one-time operational runbook / controlled DB procedure / migration by authorised operators — **never** `ENV_ADMIN_EMAIL` or environment-based admin |
| 18 | **Break-glass:** **NOT SUPPORTED** |
| 19 | **Impersonation:** **NOT SUPPORTED** |
| 20 | **Admin BFF:** session-authenticated `POST /admin/v1/…` only — not Merchant `/v1`; machine API credentials must not access |
| 21 | **H0 reads:** unchanged — ADR-032 read capability catalogue and inspection paths remain |
| 22 | **Deferred (non-blocking for H1 Option A):** merchant suspend/unsuspend; user disable/enable; all DLQ/webhook/notification/financial replay; durable DLQ; PII/support search; financial corrections; ledger admin view; audit export/SIEM; additional admin roles |

---

## Closed privileged action catalogue (H1)

| Action | Capability | Risk | Dual control | Recent MFA |
| --- | --- | --- | --- | --- |
| `admin.grant.create` | `admin.grant.manage` | HIGH | Required | Request / approve / execute |
| `admin.grant.revoke` | `admin.grant.manage` | HIGH | Required | Request / approve / execute |

Unknown actions **denied**. No wildcard. No other mutation capabilities in H1.

---

## PrivilegedAuthenticationContext (provider-neutral)

Bound application context for privileged grant steps. Provider-specific MFA/passkey mechanics remain OD-023/OD-024.

| Field | Purpose |
| --- | --- |
| `authenticatedAt` | Session/authentication time (UTC) |
| `mfaSatisfiedAt` | Last time MFA (or equivalent step-up) was satisfied for this principal (UTC) |
| `methods[]` | Provider-neutral method labels recorded for audit (e.g. `totp`, `webauthn`) — not secret material |

### Recent MFA rule (binding)

For **request**, **approve**, and **execute** of `admin.grant.create` / `admin.grant.revoke`:

- `mfaSatisfiedAt` must be present
- `now - mfaSatisfiedAt ≤ 15 minutes`
- Failure → reject step; emit deny/fail audit (+ security event per existing authorisation-denied semantics)

OD-024 remains **open** for how the IdP produces `mfaSatisfiedAt`. This ADR binds **when** recent MFA is required and the **max age**, not the provider product.

---

## Dual-control matrix (Option B — grants only)

Resolves OD-026 **for grant actions only**. Break-glass remains NOT SUPPORTED. Other mutation classes stay deferred.

| Rule | Binding |
| --- | --- |
| Requester ≠ approver | Enforced by principal identity (`user_id`) |
| Approver eligibility | Active `platform_admin` with `admin.grant.manage` |
| Requester eligibility | Active `platform_admin` with `admin.grant.manage` |
| Approvals required | Exactly **one** distinct approver |
| Expiry | Pending requests expire **24 hours** after creation → terminal `expired` |
| Fingerprint immutability | Action type + target + payload fingerprint fixed at request; approve/execute must match; mutation of request body after create forbidden |
| Self-approve | **Prohibited** |
| Execute actor | May be requester or a third active admin with capability — still requires recent MFA; must not bypass approval |

---

## Models

### PrivilegedActionRequest

| Field | Purpose |
| --- | --- |
| `id` | Internal PK (UUID) |
| `public_id` | Opaque public ID for admin UI/API (`par_…` proposed) |
| `action` | `admin.grant.create` \| `admin.grant.revoke` |
| `risk_class` | `HIGH` (denormalised for audit filters) |
| `target_type` | `user` |
| `target_public_id` | Mandatory `usr_…` |
| `payload_fingerprint` | Canonical hash of immutable request payload |
| `payload` | Minimal structured payload (e.g. target `usr_…`; no secrets) |
| `reason` | 16–500 chars |
| `status` | See §States |
| `requester_user_id` | FK → `users.id` |
| `expires_at` | `created_at + 24h` |
| `executed_at` | Set once on successful execute |
| `execution_result` | Compact safe result summary |
| `created_at` / `updated_at` | Timestamps |

### PrivilegedActionApproval

| Field | Purpose |
| --- | --- |
| `id` | Internal PK (UUID) |
| `request_id` | FK → PrivilegedActionRequest |
| `approver_user_id` | FK → `users.id` — must ≠ requester |
| `decision` | `approved` \| `denied` |
| `reason` | Optional approver note (same char bounds / no secrets policy if present) |
| `mfa_satisfied_at` | Snapshot from PrivilegedAuthenticationContext at approve time |
| `created_at` | Approval timestamp |

Unique: at most one approving decision that advances the request (product may store deny rows; approve count that gates execute is exactly one).

### PlatformAdminGrant (lifecycle update)

Aligns with ADR-032 row; H1 binds status values:

| Field | Purpose |
| --- | --- |
| `id` | Internal PK |
| `user_id` | FK → `users.id`, **unique** |
| `status` | `active` \| `revoked` |
| `created_at` / `updated_at` | Timestamps |
| `revoked_at` | Set when status → `revoked` |

Only `status = active` confers admin. Re-create after revoke may upsert/reactivate per execute semantics — still via PrivilegedActionRequest, never silent.

---

## States and transitions

```text
pending → approved → executed
pending → denied
pending → expired
approved → cancelled   (optional pre-execute cancel by requester or policy; not required for MVP if unused)
approved → failed      (execute attempted; durable failure recorded; may retry only if not applied — see idempotency)
```

| From | To | Gate |
| --- | --- | --- |
| — | `pending` | Request + recent MFA + capability + reason + valid `usr_…` + self-grant/last-admin prechecks |
| `pending` | `approved` | One eligible approver ≠ requester + recent MFA + fingerprint match + not expired |
| `pending` | `denied` | Eligible approver ≠ requester + recent MFA (deny does not execute) |
| `pending` | `expired` | Clock ≥ `expires_at` with no approval |
| `approved` | `executed` | Recent MFA + fingerprint match + idempotent apply of grant create/revoke + last-admin checks |
| `approved` | `failed` | Execute rejected after approval (e.g. race: last admin; target missing) — audit fail |

Terminal: `executed`, `denied`, `expired`, `failed` (failed may allow controlled re-drive only if grant change **not** applied — never double-apply).

---

## Reason policy

| Rule | Binding |
| --- | --- |
| Required | On PrivilegedActionRequest create |
| Length | 16–500 Unicode characters (trimmed) |
| Content | Human operational justification |
| Forbidden | Secrets, tokens, passwords, PAN/CHD, full PII dumps, raw auth subjects |
| Retention | Retained with request/audit per audit retention policy |
| Display | Visible to platform admins with grant-manage / audit views as safe text |

---

## Grant targeting and lifecycle rules

1. Target **must** be User `public_id` with prefix `usr_` (ADR-020 opacity).
2. Email / IdP subject / internal UUID **must not** be accepted as grant target in admin APIs.
3. `admin.grant.create` → ensure active grant for target user (create or reactivate).
4. `admin.grant.revoke` → set grant `revoked` (or reject if none/active absent).
5. **Self-grant prohibited:** requester `user_id` must not equal target user.
6. **Last-active-admin protection:** revoke that would leave zero active grants is rejected at request validation and again at execute.
7. **Self-revoke:** requester may target self **only** for `admin.grant.revoke`, and only with dual approval from another admin, and only if not last admin.

---

## Bootstrap (no ENV_ADMIN_EMAIL)

Initial production (and empty-environment) admin authority:

- **Never** `ENV_ADMIN_EMAIL`, email allowlists, or environment variables that confer `platform_admin`
- **Allowed:** one-time operational runbook — controlled DB procedure and/or authorised migration executed by named operators under change control
- Bootstrap creates the first active `PlatformAdminGrant` (and ensures target User has `usr_…`) outside the dual-control UI because dual control requires ≥2 admins
- After ≥2 active admins exist, **all** further create/revoke go through PrivilegedActionRequest
- Bootstrap steps must themselves produce durable audit (or change-record equivalent) outside casual app logs

Exact SQL/runbook text is an operations artefact; this ADR binds the **forbidden** and **allowed** classes.

---

## Audit fields (mandatory for grant privileged steps)

Every request / approve / deny / execute / fail must emit durable audit (ADR-012) with at least:

| Field | Notes |
| --- | --- |
| `actor_user_public_id` | `usr_…` of actor |
| `action` | e.g. `admin.privileged_request.create`, `…approve`, `…deny`, `…execute`, `…fail` |
| `privileged_action` | `admin.grant.create` \| `admin.grant.revoke` |
| `request_public_id` | PrivilegedActionRequest public ID |
| `target_type` / `target_public_id` | `user` / `usr_…` |
| `result` | `success` \| `denied` \| `failed` |
| `reason` | From request (and approver note if any) — redacted if policy requires |
| `mfa_satisfied_at` | From PrivilegedAuthenticationContext |
| `correlation_id` / `request_id` | Existing request correlation |
| `payload_fingerprint` | For integrity |

No secrets in audit payloads. Pair with security events on authorisation denial where existing semantics apply.

---

## Idempotency

- Fingerprint + request ID uniquely identify the intended mutation.
- Transition to `executed` applies the grant change **once**.
- Repeat execute on already-`executed` request: return prior result (idempotent success) — do not toggle grant again.
- Concurrent execute: single-winner transactional apply.

---

## Admin routing

| Surface | Namespace |
| --- | --- |
| Admin portal UI | `/admin/*` |
| Admin BFF | `POST /admin/v1/privileged-action-requests` (and approve/execute subresources) — illustrative; exact paths platform-owned |
| Merchant public API | `/v1/*` — **no** admin grant controls |

Style remains BFF `POST /admin/v1/…` session routes only.

### Session / CSRF / MFA trust

- Privileged mutations use the existing admin session cookie + BFF CSRF protections (same class as other admin POSTs).
- `PrivilegedAuthenticationContext` is **server-derived** from IdP/session claims — never trust a client boolean such as `mfa=true`.
- No mutation via `GET`.

### Rate limiting

- Grant request / approve / execute must be rate-limited per admin principal (and preferably per target `usr_…`).
- Default admin read limits are insufficient alone — apply **stricter** throttles on privileged grant POSTs so grant churn cannot be unbounded.

### UI interaction style (binding for platform H1)

- Explicit target `usr_…`, explicit reason, visible recent-MFA status, approval status, destructive confirmation before execute.
- No one-click grant create/revoke.
- Grant list shows active grants by safe `usr_…` — no email directory search.

---

## Explicitly deferred (non-blocking for H1 Option A)

| Item | Status |
| --- | --- |
| Merchant suspend / unsuspend | Deferred |
| User disable / enable | Deferred |
| DLQ / webhook / notification / financial replay | Deferred |
| Durable DLQ operator store | Deferred |
| PII / support search | Deferred |
| Financial corrections | Deferred |
| Break-glass | **NOT SUPPORTED** |
| Impersonation | **NOT SUPPORTED** |
| Ledger admin view | Deferred |
| Audit export / SIEM | Deferred |
| Additional admin roles (support/risk/finance) | Deferred |

These do **not** block H1 grant-management implementation. They **do** keep canonical Phase H incomplete.

---

## Production safety review

| Risk | H1 Option A policy |
| --- | --- |
| Single-actor grant change | Forbidden — dual control required |
| Self-grant | Forbidden |
| Self-approve | Forbidden |
| Last admin lockout | Forbidden — last-active-admin protection |
| ENV/email bootstrap creep | Forbidden — runbook/DB procedure only |
| Stale MFA | Forbidden — 15-minute max for request/approve/execute |
| Merchant `/v1` grant APIs | Forbidden |
| Silent re-execute | Forbidden — idempotent once |
| Break-glass bypass | NOT SUPPORTED |
| Impersonation to obtain grant | NOT SUPPORTED |
| Scope creep into suspend/replay/PII | Deferred — out of H1 Option A |
| Production without IdP MFA | Still blocked by OD-024 for production admin deployment |

---

## Consequences

### Positive

- Platform can implement grant create/revoke without inventing full ops-mutation policy
- Dual control + recent MFA + reason bound for the highest-leverage privilege (who is admin)
- Preserves ADR-032 authority model; extends grant status to `revoked`
- Clear H2+ handoff for replay, suspend, corrections, PII search

### Negative / tradeoffs

- Cannot remediate merchants/users or replay DLQ from admin UI in H1
- Bootstrap of the first admin remains a controlled out-of-band procedure
- Production admin still waits on OD-023/OD-024 provider MFA capable of populating `PrivilegedAuthenticationContext`
- OD-026 only resolved for grants — other dual-control matrices remain future work

### Residual risks (documented)

- Collusion between two admins remains possible — mitigated by audit, not prevented
- Bootstrap runbook abuse — mitigated by change control + audit, not by in-app dual control
- Without production MFA, stolen session risk remains until OD-024 closed

---

## H2+ handoff

Deferred privileged catalogue and operator tooling (replay, durable DLQ, financial corrections, PII/support lookup, role matrix, export/SIEM) require a separate decision gate — do not stretch ADR-033.

---

## Verification

Platform H1 grant management must satisfy:

- [FUN-ADM-005](../../requirements/functional/FUN-ADM-005.md), [FUN-ADM-006](../../requirements/functional/FUN-ADM-006.md)
- [NFR-SEC-009](../../requirements/security/NFR-SEC-009.md), [NFR-SEC-010](../../requirements/security/NFR-SEC-010.md)
- Tests [ADM-PRIV-001](../../requirements/tests/ADM-PRIV-001.md), [ADM-PRIV-002](../../requirements/tests/ADM-PRIV-002.md), [ADM-DUAL-001](../../requirements/tests/ADM-DUAL-001.md), [ADM-GRANT-001](../../requirements/tests/ADM-GRANT-001.md)–[ADM-GRANT-003](../../requirements/tests/ADM-GRANT-003.md)

Design: [SEQ-SEC-006](../design/security/admin-grant-dual-control.md).

Gate: [phase-h1-admin-decision-gate](../implementation/phase-h1-admin-decision-gate.md).
