# Authentication Model

Sparelane distinguishes interactive and machine authentication. Do not conflate merchant portal sessions with Merchant API credentials.

Identity provider and exact MFA/session products remain TBD.

## Consumer authentication

Interactive consumer identity for Consumer Web and Hosted Flow.

Conceptual controls:

- verified identity/account
- MFA / passkeys where supported
- secure session management
- account recovery controls
- account-takeover protections (session invalidation, sensitive-action step-up where appropriate, notifications/audit)

Consumers authenticate to manage connections, payment methods and bill visibility — not to act as merchants.

## Merchant user authentication

Interactive authentication for Merchant Portal users (finance, operations, developers configuring integrations via UI).

Distinct from machine credentials. Portal sessions must not be reused as API keys.

## Merchant machine authentication

Server-to-server authentication for Merchant API using merchant API credentials.

Conceptual model:

```text
Merchant API credential
→ merchant context
→ allowed scopes
→ request authorisation
```

See [`docs/integrations/api-authentication.md`](../integrations/api-authentication.md).

Secrets are shown once at issuance; Sparelane stores hashes/references only.

## Sparelane administrator authentication

Highest-assurance interactive authentication for Admin Portal.

Conceptual requirements:

- MFA required
- stronger session controls (shorter TTL TBD)
- explicit privileged role assignment
- durable audit of authentication and privileged actions
- no shared admin accounts

Administrator authentication is distinct from consumer and merchant authentication even if the same identity platform is eventually used.
