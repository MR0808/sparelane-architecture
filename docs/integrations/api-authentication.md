# Merchant API Authentication

Conceptual server-to-server authentication for Merchant API integrations.

## Current conceptual model

```text
Merchant API credential
→ merchant context
→ allowed scopes
→ request authorisation
```

Primary MVP approach: merchant API credentials managed by Merchant API Key Management.

OAuth client credentials and mTLS are potential enterprise alternatives and remain **TBD** unless a concrete requirement emerges.

## Credential lifecycle

1. Merchant (or operator) requests credential creation in Merchant Portal / admin tooling.
2. Sparelane creates credential metadata and scopes.
3. Secret is displayed **once** at issuance.
4. Sparelane stores **hash/reference only** — never plaintext secret after issuance.
5. Requests present the credential; Sparelane authenticates and authorises by scope.
6. Credentials support rotation, revocation, optional expiry, and last-used tracking.
7. Audit records cover create/rotate/revoke events.

## Principles

- Secret API keys are never stored in plaintext after issuance.
- Sandbox and live credentials are environment-isolated.
- Scopes limit which resources/operations a credential may access.
- Compromised credentials can be revoked without deleting the merchant organisation.

## Alternatives TBD

- OAuth 2.0 client credentials
- Mutual TLS (mTLS)
- IP allowlists as complementary controls
