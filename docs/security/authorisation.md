# Authorisation Model

Authorisation enforces what an authenticated actor may do after authentication succeeds.

## Principles

- **Deny by default** — missing permission means deny
- **Least privilege** — grant only required capabilities
- **Merchant tenant isolation** — merchant A must not read or mutate merchant B data
- **Consumer ownership checks** — consumers may only access their own profile, notification contacts, methods, connections and bills
- **Admin privilege separation** — platform admin is distinct from merchant admin and consumer authority ([ADR-032](../decisions/ADR-032-platform-admin-authority-read-only-control-plane.md))
- **Machine credential scopes** — API credentials are limited by explicit scopes
- **Financial operations require explicit permissions** — collection/settlement-sensitive actions are not ambiently available
- **Sensitive admin mutations require enhanced controls** — MFA/session assurance and audit; dual-control for **platform admin grants** is bound by [ADR-033](../decisions/ADR-033-privileged-admin-grant-management-and-approval.md). Break-glass remains **NOT SUPPORTED** ([OD-026](../decisions/open/OD-026-dual-control-break-glass.md))

Do not define detailed RBAC database schema beyond H0/H1 `PlatformAdminGrant` + PrivilegedActionRequest in this phase.

## H0 principal matrix

| Principal | Merchant portal | Consumer portal | Merchant `/v1` API | Admin `/admin` + `/admin/v1` |
| --- | --- | --- | --- | --- |
| Anonymous | Deny (auth required) | Deny | Deny (credential required) | Deny |
| Linked user (no grant) | Per membership | If consumer profile | Deny | **Deny** |
| Consumer | Deny (not merchant member) | Own resources | Deny | **Deny** |
| Merchant user / admin | Per membership role | Deny | Deny (portal session ≠ API key) | **Deny** |
| Merchant machine credential | Deny | Deny | Per scopes | **Deny** |
| **Platform admin** (active grant) | **Deny** (not merchant member) | **Deny** (not consumer) | **Deny** | **Allow** — H0 closed read capabilities; H1 `admin.grant.manage` with dual-control + recent MFA ([ADR-033](../decisions/ADR-033-privileged-admin-grant-management-and-approval.md)); H2 `admin.dlq.view` / `admin.webhook.replay` ([ADR-034](../decisions/ADR-034-durable-dead-letter-and-operator-replay-policy.md)) |

Platform admin cross-tenant **reads** use explicit admin read APIs — not merchant context spoofing. Grant create/revoke uses PrivilegedActionRequest only — never single-actor mutation.

## Conceptual role categories (future — not H0)

| Category | Typical context | H0 status |
| --- | --- | --- |
| Consumer | Own account, notification contacts, payment methods, connections, bills | Implemented (portal) |
| Merchant member | Day-to-day merchant portal access | Implemented |
| Merchant admin | Merchant organisation administration | Implemented — **≠ platform admin** |
| Merchant developer / integration | Credentials, webhooks, integration config | Partial |
| Sparelane support | Scoped operational assistance | **TBD** |
| Sparelane risk / compliance | Risk review and verification workflows | **TBD** |
| Platform admin | Platform control plane | **H0:** single authority via `PlatformAdminGrant`; **H1:** same authority + `admin.grant.manage` ([ADR-033](../decisions/ADR-033-privileged-admin-grant-management-and-approval.md)) |

Final role/permission matrix beyond H0/H1 `platform_admin` is **TBD** (support/risk/finance deferred).

## H0 read capabilities

Closed catalogue — see [admin-access.md](./admin-access.md). Unknown capability denied; no wildcard.

## H1 grant capability

`admin.grant.manage` — request/approve/execute grant create/revoke only. Dual-control + recent MFA required. See [admin-access.md](./admin-access.md) §H1 and [OD-026](../decisions/open/OD-026-dual-control-break-glass.md) (grants resolved by ADR-033; break-glass still open / not supported).

## H2 DLQ / replay capabilities

| Capability | Permits |
| --- | --- |
| `admin.dlq.view` | Durable dead-letter list/detail |
| `admin.webhook.replay` | Closed webhook replay request only |

Recent MFA ≤15m + reason required for replay. No dual control for webhook replay. No notification/financial/generic replay capabilities. See [ADR-034](../decisions/ADR-034-durable-dead-letter-and-operator-replay-policy.md).

## Machine vs interactive authorisation

Interactive portal roles and machine API scopes are separate authorisation surfaces. Possession of a portal session does not imply API credential privileges, and vice versa. Platform admin session does not imply merchant or consumer portal authority.
