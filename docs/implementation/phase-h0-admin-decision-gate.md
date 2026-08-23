# Phase H0 — Admin authority & read-only control plane decision gate (architecture)

**Status:** PASS — binding policy in [ADR-032](../decisions/ADR-032-platform-admin-authority-read-only-control-plane.md)

Platform Phase G (G0+G1+G2) is complete. H0 was blocked because admin/security policy was conceptual only — role matrix TBD, privileged actions were examples, grant rules undefined, OD-024/OD-026 open, DLQ replay not H0-sliced, `PlatformAdminGrant` absent from architecture relational model.

## Hard gate result

| # | Requirement | Result |
| --- | --- | --- |
| 1 | H0 scope slice | **Bound** — read-only control plane (Option A) |
| 2 | Platform admin authority | **Bound** — persisted `PlatformAdminGrant` |
| 3 | Implicit admin forbidden | **Bound** — no merchant/consumer/env/email admin |
| 4 | H0 role model | **Bound** — single `platform_admin` authority |
| 5 | Read capability catalogue | **Bound** — 8 closed read capabilities |
| 6 | Admin namespace | **Bound** — UI `/admin`, BFF `/admin/v1/*` |
| 7 | Server-side guard | **Bound** — grant-derived `AdminPrincipal` on every route |
| 8 | Privileged mutations | **Bound** — **none in H0** |
| 9 | Grant management | **Bound** — deferred; bootstrap/provisioning only |
| 10 | Reason/justification | **Bound** — not required for H0 reads |
| 11 | Dual control / break-glass / impersonation | **Bound** — not supported in H0 |
| 12 | DLQ UI / replay | **Bound** — **no DLQ UI in H0**; replay deferred H1+ |
| 13 | Ledger admin view | **Bound** — deferred H1 |
| 14 | Relational model alignment | **Bound** — `platform_admin_grants` documented |
| 15 | Audit completeness | **Bound** — inventory task; fix only canonical omissions |
| 16 | FUN/NFR requirements | **Bound** — FUN-ADM-001…004, NFR-SEC-008, NFR-PRIV-005 |
| 17 | Test specs | **Bound** — ADM-AUTH/DATA/FIN/AUD-* |

## Scope options evaluated

| Option | Verdict |
| --- | --- |
| **A — Read-only admin control plane** | **Selected for H0** |
| B — Read-only + privileged mutations | Rejected — requires closed mutation catalogue, reason, MFA/re-auth, approval (not bound) |
| C — Full Phase H admin/replay platform | Rejected — requires OD-024/026 resolution and replay policy invention |

## H0 principle

> H0 proves **who** is a platform admin and **what** they may safely **inspect**.
> It does **not** yet prove what admins may **mutate** across the platform.

## Platform H0 must implement

1. Reuse B0 `PlatformAdminGrant` + `resolveAdmin()` — no parallel admin identity
2. `requirePlatformAdmin` (or equivalent) wrapping persisted grant check on every `/admin/v1/*` route
3. Admin portal shell at `/admin` — navigation only for implemented read views; **no** unsupported mutation buttons
4. Admin BFF at `/admin/v1/*` — session-authenticated; not Merchant `/v1`
5. Read APIs behind closed capability checks:
   - OperationalSnapshot (`admin.dashboard.view`)
   - exact public-ID lookups: merchant, consumer, bill, payment workflow, settlement
   - read-only audit + security-event queries
6. Safe response projections — central redaction; no secrets/tokens/bank refs/auth subjects
7. Deny merchant_admin, consumer, anonymous on admin routes (403/401 per existing policy)
8. Static/config test: no environment variable grants admin authority
9. Audit completeness **inventory** document — classify B–G; fix only architecture-bound gaps
10. Tests per ADM-* specs; `npm run test:phase-h0` in platform (future)

## Must not invent (H0)

- support/risk/finance admin roles
- grant CRUD or self-grant/last-admin rules
- privileged mutation enum or mandatory reason for reads
- DLQ replay or durable DLQ UI on in-memory queue
- impersonation / break-glass / dual-control engine
- email/PII search for consumer lookup
- direct financial DB mutation from admin module
- generic admin command executor
- ledger edit / balance correction UI

## Engineering decomposition (local slices)

| Slice | Scope |
| --- | --- |
| **H0** | Platform admin authority + read-only control plane + audit/security read views + audit completeness inventory |
| **H1** | Privileged admin mutations + DLQ replay policy + grant management rules + reason/MFA/dual-control where resolved |
| **H2+** | Stronger support/ops tooling, SIEM export, scoped PII lookup — as separately gated |

Canonical **Phase H** is **not** complete after H0.

## Still TBD (not H0 blockers)

- [OD-024](../decisions/open/OD-024-mfa-passkey.md) admin MFA / passkey (blocks **production** admin deployment)
- [OD-026](../decisions/open/OD-026-dual-control-break-glass.md) dual control / break-glass (blocks H1 privileged mutations)
- Durable DLQ / operator message store topology
- Production admin grant bootstrap runbook
- Support/risk/finance role matrix
- PII/support case-scoped lookup policy
- Audit export / SIEM integration

## H1 decision gate must resolve

1. Closed **mutation** privileged-action catalogue
2. Mandatory reason/justification policy per action class
3. MFA/re-auth per action (OD-024)
4. Dual control requirements (OD-026)
5. Grant management rules (self-grant, last-admin, approval)
6. DLQ replay semantics (who, reason, event types, financial controls, identity preservation, concurrency, audit)
7. Financial correction invocation paths (domain use cases only)
8. PII/support lookup policy
9. Durable DLQ operator store + optional read-only inspection before replay
10. Ledger read-only inspection (if desired)

## Platform implementation checklist

- [ ] Canonical `PlatformAdminGrant` read authority (reuse B0)
- [ ] `requirePlatformAdmin` on all admin BFF routes
- [ ] `/admin` UI shell (separate layout)
- [ ] `/admin/v1/*` BFF routes
- [ ] OperationalSnapshot admin view
- [ ] Merchant exact-`mrc_…` lookup
- [ ] Consumer exact-`con_…` lookup
- [ ] Bill / PaymentWorkflow / Settlement exact public-ID lookups
- [ ] Read-only audit query
- [ ] Read-only security-event query
- [ ] No PII/email search
- [ ] No admin mutations
- [ ] No DLQ UI/replay
- [ ] No grant CRUD
- [ ] No impersonation / break-glass
- [ ] Architecture boundary tests (no financial direct mutation)
- [ ] ADM-* security tests
- [ ] Audit completeness inventory doc
- [ ] Dev docs: admin-authority, admin-portal, privileged-actions (H1 deferrals), audit-completeness

## Production safety review (ADR-032 prevents)

| Risk | H0 policy |
| --- | --- |
| Merchant admin → platform admin | Forbidden |
| Env/email admin grant | Forbidden |
| Admin as DB browser | Forbidden — read ports + safe projections only |
| Secret reveal | Forbidden |
| PII search creep | Forbidden — exact public ID only |
| Direct financial mutation | Forbidden |
| Unreviewed replay | Forbidden — no replay in H0 |
| Impersonation | Forbidden |
| Break-glass bypass | Forbidden |
| Speculative dual control | Forbidden — deferred H1 |

## Exit criterion

**H0 ADMIN DECISION GATE: PASS**

Platform may proceed to H0 implementation without inventing admin/security mutation policy.
