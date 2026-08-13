# Authorisation Model

Authorisation enforces what an authenticated actor may do after authentication succeeds.

## Principles

- **Deny by default** — missing permission means deny
- **Least privilege** — grant only required capabilities
- **Merchant tenant isolation** — merchant A must not read or mutate merchant B data
- **Consumer ownership checks** — consumers may only access their own profile, methods, connections and bills
- **Admin privilege separation** — support, risk/compliance and platform admin capabilities are distinct
- **Machine credential scopes** — API credentials are limited by explicit scopes
- **Financial operations require explicit permissions** — collection/settlement-sensitive actions are not ambiently available
- **Sensitive admin actions require enhanced controls** — MFA/session assurance and audit (dual-control workflows remain TBD)

Do not define detailed RBAC database schema in this phase.

## Conceptual role categories

| Category | Typical context |
| --- | --- |
| Consumer | Own account and payment methods |
| Merchant member | Day-to-day merchant portal access |
| Merchant admin | Merchant organisation administration |
| Merchant developer / integration | Credentials, webhooks, integration config |
| Sparelane support | Scoped operational assistance |
| Sparelane risk / compliance | Risk review and verification workflows |
| Platform admin | Highest platform configuration privileges |

Final role/permission matrix is **TBD**.

## Machine vs interactive authorisation

Interactive portal roles and machine API scopes are separate authorisation surfaces. Possession of a portal session does not imply API credential privileges, and vice versa.
