# Admin Access Controls

Controls for Sparelane administrative operations.

**H0 binding policy:** [ADR-032](../decisions/ADR-032-platform-admin-authority-read-only-control-plane.md) — read-only control plane foundation.

**H1 binding policy:** [ADR-033](../decisions/ADR-033-privileged-admin-grant-management-and-approval.md) — grant management only (Option A).

**H2 binding policy:** [ADR-034](../decisions/ADR-034-durable-dead-letter-and-operator-replay-policy.md) — durable DLQ inspection + closed webhook replay only (Option A).

## H0 — platform admin authority

- **Persisted grant only:** `PlatformAdminGrant` on `users` — resolved via `ExternalIdentity → User → active grant → AdminPrincipal`
- **No implicit admin:** merchant roles, consumer status, email/domain, environment variables, URL, or headers never grant platform admin
- **Single H0 authority:** `platform_admin` only — support/risk/finance roles remain **future/TBD**
- **Namespaces:** admin UI `/admin`; admin BFF `/admin/v1/*` — not Merchant `/v1`
- **Server guard:** every admin route requires grant-derived principal; frontend visibility is not authorisation
- **Grant management:** **none in H0** — bootstrap/provisioning data only; rules deferred to H1 ([ADR-033](../decisions/ADR-033-privileged-admin-grant-management-and-approval.md))

## H0 — read-only control plane

Closed read capabilities (deny-by-default):

| Capability | Permits |
| --- | --- |
| `admin.dashboard.view` | Admin home + OperationalSnapshot |
| `admin.merchant.view` | Merchant by exact `mrc_…` |
| `admin.consumer.view` | Consumer by exact `con_…` |
| `admin.bill.view` | Bill by exact public ID |
| `admin.payment.view` | PaymentWorkflow by exact public ID |
| `admin.settlement.view` | Settlement by exact public ID |
| `admin.audit.view` | Read-only audit query |
| `admin.security_event.view` | Read-only security-event query |

**Not in H0:** DLQ UI, ledger inspection, privileged mutations, grant CRUD, impersonation.

Lookups: exact public ID only — no email/auth-subject/fuzzy search.

Data minimisation: no secret reveal, provider tokens, bank refs, signing secrets.

## H0 — explicitly not supported

- privileged business mutations (suspend, disable, corrections, replay)
- impersonation / login-as
- break-glass (OD-026 remains open for break-glass; **NOT SUPPORTED** in H0/H1)
- dual control (not required for read-only H0)
- DLQ replay UI (deferred H2+; no DLQ UI in H0 — in-memory DLQ not operator tooling)
- audit export / SIEM

## H1 — grant management (Option A)

Binding: [ADR-033](../decisions/ADR-033-privileged-admin-grant-management-and-approval.md). Closed mutation catalogue only — **not** merchant suspend, user disable, DLQ/webhook replay, or financial corrections.

### Capability

| Capability | Permits |
| --- | --- |
| `admin.grant.manage` | Request, approve, and execute `admin.grant.create` / `admin.grant.revoke` via PrivilegedActionRequest |

Deny-by-default. H0 read capabilities unchanged. No other mutation capabilities in H1.

### Dual control

- Requester ≠ approver; both active `platform_admin` with `admin.grant.manage`
- Exactly one approval; 24h request expiry; fingerprint immutability
- Self-grant prohibited; self-approve prohibited
- Self-revoke only with another admin’s approval and not last active admin
- Last-active-admin protection on revoke

### Recent MFA

Request, approve, and execute each require recent MFA (`PrivilegedAuthenticationContext`; max age **15 minutes**). MFA **policy** bound by ADR-033; production IdP = Auth0 ([ADR-041](../decisions/ADR-041-mvp-production-identity-provider-selection.md)); adapter/step-up implementation remains EXTERNAL_IMPLEMENTATION ([OD-024](../decisions/open/OD-024-mfa-passkey.md) narrowed).

### Deferred (non-blocking for H1)

- merchant suspend / unsuspend
- user disable / enable
- all DLQ / webhook / notification / financial replay (bound later by ADR-034 for DLQ + webhook only)
- durable DLQ operator store (ADR-034)
- PII / support search
- financial corrections
- break-glass (**NOT SUPPORTED**)
- impersonation (**NOT SUPPORTED**)
- ledger admin view
- audit export / SIEM
- additional admin roles (support/risk/finance)

See [SEQ-SEC-006](../design/security/admin-grant-dual-control.md) for the H1 grant dual-control sequence.

## H2 — durable DLQ and webhook replay (Option A)

Binding: [ADR-034](../decisions/ADR-034-durable-dead-letter-and-operator-replay-policy.md).

### Capabilities

| Capability | Permits |
| --- | --- |
| `admin.dlq.view` | List/detail durable `DeadLetterItem` (`dlq_…`) safe metadata |
| `admin.webhook.replay` | Create `OperatorReplayRequest` for eligible webhook DLQ only |

Deny-by-default. No `admin.notification.replay`. No generic replay capability. H0/H1 capabilities unchanged.

### Replay controls

- Closed action: `admin.webhook.replay` only (MEDIUM risk)
- Recent MFA ≤15 minutes via `PrivilegedAuthenticationContext` (reuse ADR-033 freshness; [OD-024](../decisions/open/OD-024-mfa-passkey.md) provider still open)
- Mandatory reason 16–500 chars
- **No dual control** for webhook replay ([OD-026](../decisions/open/OD-026-dual-control-break-glass.md) H2 slice)
- Financial / notification / arbitrary queue replay **prohibited**
- UI: `/admin/dlq`; BFF: `/admin/v1/dead-letters*`

### Explicitly not in H2

- notification replay (preserve ADR-031)
- financial corrections / payment-settlement-ledger command replay
- break-glass / impersonation
- merchant/user lifecycle mutations
- dismiss-without-replay mutation

See [SEQ-OPS-003](../design/operations/dlq-replay.md) and [SEQ-OPS-005](../design/operations/operator-webhook-replay.md).

## MVP — compensating ledger correction (ADR-036)

Binding: [ADR-036](../decisions/ADR-036-financial-compensating-correction-policy.md). **Not** part of H0–H2 catalogues; closed privileged slice for FIN-INV-07 / FUN-SET-007/008.

### Capability / action

| Capability / action | Risk | Dual control | Recent MFA |
| --- | --- | --- | --- |
| `admin.ledger.correct` | CRITICAL | Required | Request / approve / execute ≤15m |

### Binding rules (summary)

- Target: source journal `jt_…` only; eligible `collection` journals under ADR-036 eligibility
- Effect: append balanced `correction` journal; **no** PaymentWorkflow / Settlement status rewrite; **no** PSP refund / payout reverse
- Dual control: requester ≠ approver; fingerprint immutability; 24h expiry ([OD-026](../decisions/open/OD-026-dual-control-break-glass.md) narrowed for this action)
- Reason 16–500 chars; durable audit (ADR-012)
- Prohibited: force-balance, arbitrary debit/credit UI, impersonation, break-glass, Merchant API corrections

See [SEQ-MONEY-007](../design/money/ledger-compensating-correction.md).

## Production controls (canonical, some deferred)

- MFA required for administrator authentication ([NFR-SEC-004](../../requirements/security/NFR-SEC-004.md); [OD-024](../decisions/open/OD-024-mfa-passkey.md) — policy portion for privileged steps bound by ADR-033/ADR-034/ADR-036; provider still open)
- recent MFA (≤15 min) for privileged grant request/approve/execute ([ADR-033](../decisions/ADR-033-privileged-admin-grant-management-and-approval.md); [NFR-SEC-009](../../requirements/security/NFR-SEC-009.md)), for H2 webhook replay ([ADR-034](../decisions/ADR-034-durable-dead-letter-and-operator-replay-policy.md); [NFR-SEC-011](../../requirements/security/NFR-SEC-011.md)), and for ledger correction ([ADR-036](../decisions/ADR-036-financial-compensating-correction-policy.md); [NFR-SEC-012](../../requirements/security/NFR-SEC-012.md))
- short-lived admin sessions (exact TTL TBD)
- no shared admin accounts
- durable audit trail for **privileged mutations** ([ADR-012](../decisions/ADR-012-privileged-admin-audit.md)) — H1 grant catalogue; H2 webhook replay catalogue; ADR-036 ledger correction catalogue
- elevated mutations visible in audit with actor, action, target, result, correlation IDs
- support access scoped to legitimate need (tenant/case scoping TBD — future roles)
- financial mutations tightly controlled — **none in H0, H1, or H2 Option A** (H2 webhook replay is transport-only); MVP books correction only via ADR-036
- production secret access restricted (via secrets management; no casual UI exposure)
- **no direct ledger mutation through admin UI** — ledger append-only via constrained financial write paths ([ADR-013](../decisions/ADR-013-ledger-operational-separation.md)); ADR-036 is append-only compensating journals only

## Break-glass access

Emergency elevated access may be required for incident response.

**NOT SUPPORTED** in H0, H1, H2, or ADR-036 ([ADR-033](../decisions/ADR-033-privileged-admin-grant-management-and-approval.md), [ADR-034](../decisions/ADR-034-durable-dead-letter-and-operator-replay-policy.md), [ADR-036](../decisions/ADR-036-financial-compensating-correction-policy.md)). Break-glass remains deferred ([OD-026](../decisions/open/OD-026-dual-control-break-glass.md)). Dual-control for **platform admin grants** is resolved by ADR-033; webhook replay dual-control is **not required** by ADR-034; **ledger corrections** require dual control per ADR-036.

## Future privileged actions (H3+ examples — not ADR-036)

- merchant approval / suspension
- credential revocation assistance
- notification replay (separate gate; preserve ADR-031)
- payment investigation tooling with mutation paths
- production configuration changes affecting financial flows
- PSP refund / payout reverse workflows (explicit future ADRs)

General privileged-mutation pattern: [SEQ-SEC-004](../design/security/admin-privileged-action.md). H1 grant flow: [SEQ-SEC-006](../design/security/admin-grant-dual-control.md). H2 DLQ/webhook: [SEQ-OPS-003](../design/operations/dlq-replay.md), [SEQ-OPS-005](../design/operations/operator-webhook-replay.md). Ledger correction: [SEQ-MONEY-007](../design/money/ledger-compensating-correction.md).
