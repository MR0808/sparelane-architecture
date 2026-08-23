# Admin Access Controls

Controls for Sparelane administrative operations.

**H0 binding policy:** [ADR-032](../decisions/ADR-032-platform-admin-authority-read-only-control-plane.md) — read-only control plane foundation.

**H1 binding policy:** [ADR-033](../decisions/ADR-033-privileged-admin-grant-management-and-approval.md) — grant management only (Option A).

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

Request, approve, and execute each require recent MFA (`PrivilegedAuthenticationContext`; max age **15 minutes**). MFA **policy** bound by ADR-033; IdP/provider implementation remains open ([OD-024](../decisions/open/OD-024-mfa-passkey.md), [OD-023](../decisions/open/OD-023-identity-provider.md)).

### Deferred (non-blocking for H1)

- merchant suspend / unsuspend
- user disable / enable
- all DLQ / webhook / notification / financial replay
- durable DLQ operator store
- PII / support search
- financial corrections
- break-glass (**NOT SUPPORTED**)
- impersonation (**NOT SUPPORTED**)
- ledger admin view
- audit export / SIEM
- additional admin roles (support/risk/finance)

See [SEQ-SEC-006](../design/security/admin-grant-dual-control.md) for the H1 grant dual-control sequence.

## Production controls (canonical, some deferred)

- MFA required for administrator authentication ([NFR-SEC-004](../../requirements/security/NFR-SEC-004.md); [OD-024](../decisions/open/OD-024-mfa-passkey.md) — policy portion for privileged steps bound by ADR-033; provider still open)
- recent MFA (≤15 min) for privileged grant request/approve/execute ([ADR-033](../decisions/ADR-033-privileged-admin-grant-management-and-approval.md); [NFR-SEC-009](../../requirements/security/NFR-SEC-009.md))
- short-lived admin sessions (exact TTL TBD)
- no shared admin accounts
- durable audit trail for **privileged mutations** ([ADR-012](../decisions/ADR-012-privileged-admin-audit.md)) — H1 grant request/approve/execute catalogue
- elevated mutations visible in audit with actor, action, target, result, correlation IDs
- support access scoped to legitimate need (tenant/case scoping TBD — future roles)
- financial mutations tightly controlled — **none in H0 or H1 Option A**
- production secret access restricted (via secrets management; no casual UI exposure)
- **no direct ledger mutation through admin UI** — ledger append-only via constrained financial write paths ([ADR-013](../decisions/ADR-013-ledger-operational-separation.md))

## Break-glass access

Emergency elevated access may be required for incident response.

**NOT SUPPORTED** in H0 or H1 ([ADR-033](../decisions/ADR-033-privileged-admin-grant-management-and-approval.md)). Break-glass remains deferred H2+ ([OD-026](../decisions/open/OD-026-dual-control-break-glass.md)). Dual-control for **platform admin grants** is resolved by ADR-033.

## Future privileged actions (H2+ examples — not H1)

- merchant approval / suspension
- credential revocation assistance
- webhook / DLQ replay for authorised operators
- payment investigation tooling with mutation paths
- production configuration changes affecting financial flows

General privileged-mutation pattern: [SEQ-SEC-004](../design/security/admin-privileged-action.md). H1 grant flow: [SEQ-SEC-006](../design/security/admin-grant-dual-control.md).
