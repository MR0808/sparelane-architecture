# Authentication Model

Sparelane distinguishes interactive and machine authentication. Do not conflate merchant portal sessions with Merchant API credentials.

**Human IdP architecture (ADR-043):** **Better Auth** for all human populations (consumer, merchant user, platform admin). Auth0 is removed from the target architecture. Sparelane remains authorisation SoT. Privileged MFA freshness uses Sparelane `AuthenticationAssurance` (not Auth0 `amr`/`auth_time`). See [ADR-043](../decisions/ADR-043-unified-better-auth-human-authentication.md). ADR-041 and ADR-042 are **Superseded**.

## Target flow

```text
Browser → Better Auth → session → BetterAuthAuthenticationProvider
→ AuthenticatedSubject (+ mfaSatisfiedAt from AuthenticationAssurance)
→ ExternalIdentity → User → Sparelane authorisation
```

## Consumer authentication

Email + password (MVP); email verification before payment-method mutations. MFA not required for ADR-033. Magic-link/OTP/passkeys deferred.

## Merchant user authentication

Better Auth email/password. MFA (TOTP) **required** for `OWNER`/`ADMIN` before API-credential UI mutations. Portal sessions ≠ API keys.

## Merchant machine authentication

Unchanged — merchant API credentials (hash/pepper). See [`docs/integrations/api-authentication.md`](../integrations/api-authentication.md).

## Sparelane administrator authentication

Better Auth with **mandatory** TOTP enrollment before admin BFF use. Privileged request/approve/execute require `mfaSatisfiedAt` ≤ **15 minutes** (ADR-033) from Sparelane AuthenticationAssurance after verified TOTP step-up. Provider account alone never grants `PlatformAdminGrant`. No ENV admin. No break-glass unless a later Accepted ADR.

## Session vs MFA freshness

Sessions may last hours/days. Privileged MFA assurance is ≤15 minutes and must not be extended by session refresh, cookie renewal, trust-device, or backup codes.
