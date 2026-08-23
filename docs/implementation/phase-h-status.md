# Phase H — Security / Admin Hardening (architecture status)

**Canonical Phase H status:** **IN PROGRESS** (not complete).

**Platform H0 status:** **PASS** — read-only admin control plane evidenced in `sparelane-platform` (`npm run test:phase-h0`; `docs/development/phase-h0-final-status.md`).

**Platform H1 status:** **PASS** — dual-control grant management evidenced in `sparelane-platform` (`npm run test:phase-h1`; `docs/development/phase-h1-final-status.md`). Local/test MFA doubles only; production IdP MFA still open ([OD-024](../decisions/open/OD-024-mfa-passkey.md)).

**Architecture H2 status:** **PASS** — durable DLQ + webhook replay policy bound by [ADR-034](../decisions/ADR-034-durable-dead-letter-and-operator-replay-policy.md). Platform H2 **not started**.

**Canonical Phase H:** admin workflows, audit completeness, security controls, operational tooling (including DLQ replay UI — architecture H2 Option A; platform pending).

## Engineering decomposition

| Slice | Architecture gate | Platform status |
| --- | --- | --- |
| **H0** | [phase-h0-admin-decision-gate](./phase-h0-admin-decision-gate.md) — **PASS** | **PASS** (read-only; local evidence; OD-024 blocks production admin) |
| **H1** | [phase-h1-admin-decision-gate](./phase-h1-admin-decision-gate.md) — **PASS** (Option A: grant management only; [ADR-033](../decisions/ADR-033-privileged-admin-grant-management-and-approval.md)) | **PASS** (grant create/revoke dual-control; local evidence; OD-024 blocks production MFA) |
| **H2** | [phase-h2-admin-decision-gate](./phase-h2-admin-decision-gate.md) — **PASS** (Option A: durable DLQ + webhook replay; [ADR-034](../decisions/ADR-034-durable-dead-letter-and-operator-replay-policy.md)) | **Not started** — [phase-h2-platform-checklist](./phase-h2-platform-checklist.md) |
| **H3+** | Future — lifecycle mutations, notification replay, corrections, SIEM, roles | Not started |

## What H0 proves

- Persisted `PlatformAdminGrant` is the sole platform-admin authority
- Separate admin control plane (`/admin` UI + `/admin/v1/*` BFF)
- Deny-by-default closed catalogue of 8 read capabilities
- Safe exact public-ID inspection (merchant/consumer/bill/payment/settlement)
- Operational snapshot (admin-only)
- Audit + security-event visibility
- No financial mutation from admin reads
- No admin privilege from merchant roles, env vars, or email/domain allowlists

## What H1 proves (platform PASS — local)

- Closed mutation catalogue: `admin.grant.create` / `admin.grant.revoke` + capability `admin.grant.manage`
- Dual control + recent MFA (≤15 min inclusive) via PrivilegedActionRequest
- User `usr_…` mandatory for grant targeting
- Last-active-admin protection under concurrent revoke (`FOR UPDATE`)
- Safe audit for request / approve / deny / execute / fail / expire + grant created/revoked
- Explicit deferral of replay, suspend, financial corrections, break-glass, impersonation, PII search

## What H2 proves (architecture PASS — platform not started)

- Durable operations-owned `DeadLetterItem` (`dlq_…`) with typed pointers
- Closed replay catalogue: `admin.webhook.replay` only
- Financial / notification / generic queue replay prohibited
- Webhook replay semantics bound (same `evt_`/delivery; attempt 6+; ACTIVE endpoint; no auto-retry restart)
- MFA ≤15m + reason; no dual control for webhook replay
- `OperatorReplayRequest` (`rpl_…`) + notification-worker execution
- Notification replay deferred (preserve ADR-031)

## What H0+H1+H2 (architecture) do NOT prove

- Platform H2 implementation / verified tests
- Production MFA / IdP (OD-024 provider still open)
- Notification operator replay
- Merchant suspend / user disable
- Financial corrections / ledger admin mutation
- Impersonation / break-glass
- PII / support search
- Audit export / SIEM
- Canonical Phase H exit completeness

## Open decisions (Phase H overall)

| Item | Blocks H0 local? | Blocks production admin? | H2 Option A |
| --- | --- | --- | --- |
| [OD-024](../decisions/open/OD-024-mfa-passkey.md) MFA | No (dev/test gated identity) | **Yes** (provider) | Policy reused; provider open |
| [OD-026](../decisions/open/OD-026-dual-control-break-glass.md) | No | Grants + webhook-replay dual-control resolved; break-glass deferred | Webhook dual-control **not required** |
| Durable DLQ store | No | Architecture bound | ADR-034 Accepted |
| Admin grant bootstrap runbook | No | Partial | Bound by ADR-033 |
| Support/risk role matrix | No | Future | Deferred |

## Next step

Implement **platform H2** per [phase-h2-platform-checklist](./phase-h2-platform-checklist.md). Do **not** mark canonical Phase H complete after architecture H2 alone — H3+ gates remain for remaining Phase H capabilities and production blockers.
