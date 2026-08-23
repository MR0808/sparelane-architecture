# Phase H — Security / Admin Hardening (architecture status)

**Canonical Phase H:** admin workflows, audit completeness, security controls, operational tooling (including DLQ replay UI — **not H0/H1**).

**Canonical Phase H status:** **IN PROGRESS** (not complete).

**Platform H0 status:** **PASS** — read-only admin control plane evidenced in `sparelane-platform` (`npm run test:phase-h0`; `docs/development/phase-h0-final-status.md`).

**Platform H1 status:** **Not started** — architecture H1 gate **PASS**; implementation of grant management may begin.

## Engineering decomposition

| Slice | Architecture gate | Platform status |
| --- | --- | --- |
| **H0** | [phase-h0-admin-decision-gate](./phase-h0-admin-decision-gate.md) — **PASS** | **PASS** (read-only; local evidence; OD-024 blocks production admin) |
| **H1** | [phase-h1-admin-decision-gate](./phase-h1-admin-decision-gate.md) — **PASS** (Option A: grant management only; [ADR-033](../decisions/ADR-033-privileged-admin-grant-management-and-approval.md)) | **Not started** — may implement grant management only |
| **H2+** | Future — DLQ/replay, support tooling, SIEM, scoped PII lookup, suspend/disable | Not started |

## What H0 proves

- Persisted `PlatformAdminGrant` is the sole platform-admin authority
- Separate admin control plane (`/admin` UI + `/admin/v1/*` BFF)
- Deny-by-default closed catalogue of 8 read capabilities
- Safe exact public-ID inspection (merchant/consumer/bill/payment/settlement)
- Operational snapshot (admin-only)
- Audit + security-event visibility (security view via AuditEvent taxonomy)
- No financial mutation from admin reads
- No admin privilege derived from merchant roles, env vars, or email/domain allowlists

## What H0 does NOT prove

- Production MFA / IdP (OD-024 provider still open; policy narrowed by ADR-033)
- Grant management CRUD (bound for H1 by ADR-033 — platform not started)
- Broader privileged mutations / break-glass (deferred H2+)
- DLQ UI / replay / webhook replay (deferred H2+)
- Impersonation
- Financial corrections
- PII / support search
- Ledger inspection / audit export

## What H1 gate binds (architecture PASS)

- Closed catalogue: `admin.grant.create` / `admin.grant.revoke` + capability `admin.grant.manage`
- Dual control + recent MFA (≤15 min) via PrivilegedActionRequest
- User `usr_…` mandatory for grant targeting
- Explicit deferral of replay, suspend, financial corrections, break-glass, etc.

## Open decisions (Phase H overall)

| Item | Blocks H0 local? | Blocks production admin? | H1 Option A |
| --- | --- | --- | --- |
| [OD-024](../decisions/open/OD-024-mfa-passkey.md) MFA | No (dev/test gated identity) | **Yes** (provider) | Policy bound; provider open |
| [OD-026](../decisions/open/OD-026-dual-control-break-glass.md) | No (H0 read-only) | Grants resolved; break-glass deferred | Grants dual-control via ADR-033 |
| Durable DLQ store | No | Blocks operator replay | Deferred H2+ (not H1) |
| Admin grant bootstrap runbook | No (read existing grants) | Partial | Bound by ADR-033 (no ENV_ADMIN_EMAIL) |
| Support/risk role matrix | No (single platform_admin) | Future | Deferred |

## Next step

Platform may implement H1 **grant management only** per ADR-033. Do **not** implement DLQ replay, merchant suspend, or financial corrections in H1. Do **not** mark canonical Phase H complete after H1.
