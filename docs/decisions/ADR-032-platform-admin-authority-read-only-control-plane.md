---
id: ADR-032
title: Platform Admin Authority and Read-Only Control Plane Policy
status: Accepted
date: 2026-08-22
deciders: Architecture
consulted: Product / Security / Privacy / Operations
informed: Platform engineering
supersedes: []
related:
  - ADR-012
  - ADR-013
  - ADR-014
  - ADR-020
  - ADR-030
  - OD-024
  - OD-026
---

# ADR-032 — Platform Admin Authority and Read-Only Control Plane Policy

## Status

**Accepted**

Unblocks platform **H0** (admin authority, read-only control plane, safe operational inspection) without inventing privileged mutation policy, grant management UI, DLQ replay, impersonation, break-glass, or dual-control workflows.

Platform H0 implementation was correctly **stopped** pending this gate. See [phase-h0-admin-decision-gate](../implementation/phase-h0-admin-decision-gate.md).

## Context

Phase H — Security/Admin Hardening — was monolithic in [build-phases](../implementation/build-phases.md). Platform B0 already implements:

`ExternalIdentity → User → PlatformAdminGrant (active) → AdminPrincipal`

…but architecture lacked:

1. `PlatformAdminGrant` in the relational model (drift vs platform B0)
2. a closed H0 scope slice (unlike F0/G2 decision gates)
3. a closed read capability catalogue
4. canonical admin namespace / BFF routing
5. binding rules for grant management, privileged mutations, DLQ replay, and mandatory justification

Implementing a broad admin portal would require inventing security policy (role matrix TBD, OD-024 MFA open, OD-026 dual control open).

## Decision summary (binding for H0)

| # | Decision |
| --- | --- |
| 1 | **H0 scope:** read-only admin control plane foundation only — **no privileged business mutations** |
| 2 | **Authority:** persisted `PlatformAdminGrant` on `users` is the **sole** source of platform-admin authority for H0 |
| 3 | **Resolution chain:** `ExternalIdentity → User → active PlatformAdminGrant → AdminPrincipal` |
| 4 | **No implicit admin:** merchant roles, consumer status, email/domain, environment variables, URL, or request headers **never** grant platform admin |
| 5 | **H0 role model:** exactly one authority — `platform_admin` — no support/risk/finance admin roles in H0 |
| 6 | **Grant management:** **no** admin grant CRUD UI/API in H0; grants are bootstrap/provisioning data only |
| 7 | **Admin UI namespace:** `/admin` (separate from merchant/consumer portal) |
| 8 | **Admin BFF namespace:** `/admin/v1/*` on internal portal/BFF routes — **not** Merchant `/v1` |
| 9 | **Server guard:** every admin route requires persisted grant-derived `AdminPrincipal`; frontend visibility is not authorisation |
| 10 | **Read capabilities (closed):** see §Read capability catalogue — deny-by-default; no wildcard |
| 11 | **Lookups:** exact public ID only for merchant, consumer, bill, payment workflow, settlement — **no** email/auth-subject/fuzzy search in H0 |
| 12 | **Ledger inspection:** **deferred to H1** — H0 does not expose journal edit or balance correction |
| 13 | **OperationalSnapshot:** admin-only via authenticated BFF — not public `/health` |
| 14 | **Audit view:** read-only paginated query with safe filters — append-only store; no update/delete |
| 15 | **Security-event view:** read-only safe projection — no secret payload |
| 16 | **Audit export / SIEM:** **deferred** |
| 17 | **Routine admin reads:** **not** individually audited in H0 unless future sensitive-access policy requires |
| 18 | **Denied admin access:** use existing security-event semantics (`security.authorisation_denied`, etc.); no business audit row required for every denied GET |
| 19 | **Privileged mutations:** **none in H0** — no suspend, disable, correction, grant change, replay |
| 20 | **PrivilegedActionContext / reason:** reserved for H1+ mutations; **no mandatory reason** for H0 read-only inspection |
| 21 | **Dual control (OD-026):** **not required for H0** — no privileged mutations |
| 22 | **Break-glass:** **not supported in H0** — deferred |
| 23 | **Impersonation:** **not supported in H0** — no login-as user/merchant/consumer |
| 24 | **MFA (OD-024):** local/dev H0 may use existing gated fake/dev identity; **production admin deployment** remains blocked until IdP + admin MFA policy satisfied ([NFR-SEC-004](../../requirements/security/NFR-SEC-004.md)) |
| 25 | **DLQ UI:** **none in H0** — platform DLQ is in-memory/non-durable; operator DLQ inspection deferred until durable operator store + H1 replay policy |
| 26 | **DLQ replay / webhook replay:** **deferred to H1+** — ADR-030 §21 reserves webhook HTTP replay to Phase H broadly, not H0 |
| 27 | **Financial boundary:** admin code must **not** directly mutate PaymentWorkflow, PaymentAttempt, JournalEntry, Settlement, SettlementInstruction, or execute payment/settlement |
| 28 | **Financial reads:** read-only safe projections via application read ports only — no raw Prisma/DB browser from admin UI |
| 29 | **Cross-tenant reads:** platform admin uses explicit admin read APIs — **not** merchant context spoofing |
| 30 | **Audit completeness (H0 task):** **inventory only** — classify B–G actions; fix only omissions already explicitly required by Accepted architecture — do not invent new audit policy |
| 31 | **Data minimisation:** no secret reveal, provider tokens, bank refs, signing secrets, auth subjects, or PII search in H0 admin views |
| 32 | **H1 handoff:** privileged mutation catalogue, reason policy, grant rules, DLQ replay semantics, financial correction workflows, PII/support lookup — see [phase-h0-admin-decision-gate](../implementation/phase-h0-admin-decision-gate.md) §H1 |

---

## Platform admin authority

### Persisted grant

`platform_admin_grants` (Identity-owned):

| Field | Purpose |
| --- | --- |
| `id` | Internal PK (UUID) |
| `user_id` | FK → `users.id`, **unique** — at most one grant row per user |
| `status` | MVP: `active` — non-active/null grant does not confer admin |
| `created_at` | Grant creation timestamp |
| `updated_at` | Last metadata update |

Architecture aligns with platform B0 Prisma model. No additional H0 columns required.

### Authority separation (binding)

| Principal | Platform admin? |
| --- | --- |
| `merchant_admin` / merchant membership | **No** |
| `consumer` | **No** |
| `linked_user` without grant | **No** |
| `platform_admin` (active grant) | **Yes** |

Platform admin does **not** automatically become merchant member or consumer authority.

### Bootstrap

- **No** `ENV_ADMIN_EMAIL` or environment-based admin authority
- Initial production grants: operational/bootstrap process (exact runbook TBD — production readiness item)
- H0 platform **reads** persisted grants only

---

## Read capability catalogue (H0)

Closed enum — unknown capability **denied**:

| Capability | Permits |
| --- | --- |
| `admin.dashboard.view` | Admin home + OperationalSnapshot summary |
| `admin.merchant.view` | Merchant lookup by exact `mrc_…` public ID |
| `admin.consumer.view` | Consumer lookup by exact `con_…` public ID |
| `admin.bill.view` | Bill lookup by exact bill public ID |
| `admin.payment.view` | PaymentWorkflow lookup by exact workflow public ID |
| `admin.settlement.view` | Settlement lookup by exact settlement public ID |
| `admin.audit.view` | Paginated read-only audit query |
| `admin.security_event.view` | Paginated read-only security-event query |

**Not in H0:** `admin.dlq.view`, `admin.ledger.view`, mutation capabilities, grant management.

---

## Safe read-model fields (H0)

### Merchant (`admin.merchant.view`)

Lookup: exact `mrc_…` only.

Safe fields (illustrative): `publicId`, `status`, `businessTimezone`, `createdAt`, `updatedAt`, bounded membership count summary.

Forbidden: API credential secrets, webhook signing secrets, bank/payout destination refs.

### Consumer (`admin.consumer.view`)

Lookup: exact `con_…` only.

Safe fields: `publicId`, linkage/anonymisation state, timestamps, bounded connection/contact counts.

Forbidden: email, auth subject, notification contact values, auth tokens.

### Bill (`admin.bill.view`)

Lookup: exact bill public ID.

Safe fields: `publicId`, merchant public ID, connection public ID, `status`, amount/currency, due date, merchant reference (if classified safe).

Forbidden: internal UUID in UI primary display.

### Payment workflow (`admin.payment.view`)

Safe fields: public ID, `status`, bill public ID, ledger posting status summary, timestamps, high-level retry/action-required state.

Forbidden: provider tokens, raw provider payloads.

### Settlement (`admin.settlement.view`)

Safe fields: public settlement ID, merchant public ID, `status`, amount/currency, instruction high-level status, provider outcome code if safe.

Forbidden: payout destination reference, provider secrets.

### Audit / security events

Paginated; filters: action/type, target type, time range, request/correlation ID where permitted.

Responses pass central redaction — no secrets/PII dumps.

---

## Admin routing

| Surface | Namespace |
| --- | --- |
| Admin portal UI | `/admin/*` |
| Admin BFF (session-authenticated) | `/admin/v1/*` |
| Merchant public API | `/v1/*` — **no admin controls** |

Machine API credentials must not access admin endpoints.

---

## Audit completeness (H0 inventory scope)

H0 performs a **classification inventory** of meaningful B–G actions:

| Class | Examples |
| --- | --- |
| **MUST audit (already canonical)** | API credential lifecycle; webhook endpoint lifecycle; consumer notification contact lifecycle; future privileged admin mutations; future DLQ replay requests |
| **Operational record only** | Automated payment/settlement state transitions; webhook delivery attempts; consumer notification delivery attempts |
| **Not required in H0** | Routine admin read-only inspection |
| **Gap fix** | Only where Accepted architecture already requires audit and platform omits it |

Do not blanket-audit every automated domain event.

---

## Explicitly deferred from H0 (H1 / H2+ disposition)

**Resolved for H1 Option A by [ADR-033](./ADR-033-privileged-admin-grant-management-and-approval.md):**

- Admin grant create/revoke UI/API, self-grant / last-admin / dual approval / reason / recent MFA policy (grants only)
- Closed H1 mutation catalogue: `admin.grant.create`, `admin.grant.revoke` only
- OD-024 **policy** for privileged grant steps; OD-026 **grants-only** dual-control matrix

**Still deferred (H2+ / separate gates — not H1 Option A):**

- Break-glass (NOT SUPPORTED in H0/H1)
- Impersonation (NOT SUPPORTED in H0/H1)
- Merchant suspension / user disable by platform admin
- Financial correction workflows
- DLQ durable operator store + inspection + replay
- Manual webhook HTTP replay ([ADR-030](./ADR-030-merchant-webhook-contract-signing-and-delivery.md) Phase H tooling → **H2+**, not H1 Option A)
- Ledger/journal admin inspection
- Audit export / SIEM integration
- Support/risk/finance role matrix
- OD-024 IdP/provider MFA **implementation**; dual-control matrices beyond grants

---

## Consequences

### Positive

- Platform can implement H0 without inventing admin/security policy
- Clear separation: H0 proves **who** is admin and **what** they may safely **inspect**
- Aligns architecture schema with platform B0 `PlatformAdminGrant`
- Preserves financial integrity boundaries (ADR-012/013)

### Negative / tradeoffs

- H0 admin portal is inspection-only — no operational remediation buttons
- Production admin rollout still blocked on IdP + MFA (OD-024)
- DLQ operator tooling waits for durable store + H1 replay policy
- Support workflows needing PII search must wait for H1 privacy/support policy

### Residual risks (documented, non-blocking for local H0)

- Dev/test fake admin identity must remain environment-gated
- Without MFA, stolen admin session risk remains until OD-024 resolved for production
- Audit completeness gaps may remain until inventory completes — only fix architecture-bound omissions

---

## Verification

Platform H0 must satisfy requirements [FUN-ADM-001](../../requirements/functional/FUN-ADM-001.md)–[FUN-ADM-004](../../requirements/functional/FUN-ADM-004.md) and tests [ADM-AUTH-001](../../requirements/tests/ADM-AUTH-001.md)–[ADM-AUD-001](../../requirements/tests/ADM-AUD-001.md).

Design: [SEQ-SEC-005](../design/security/admin-read-only-control-plane.md).
