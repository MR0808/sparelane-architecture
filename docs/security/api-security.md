# API Security

Security controls for Sparelane external and experience APIs.

Merchant API product principles (resources, idempotency, errors, correlation) live in [`docs/integrations/api-principles.md`](../integrations/api-principles.md). This document covers security controls.

## Controls

- **TLS only** for external Merchant API and experience backends
- **Authentication** appropriate to actor (consumer session, merchant user session, merchant API credential, admin session)
- **Authorisation** deny-by-default with tenant/ownership checks and scopes
- **Scoped credentials** for machine access
- **Rate limiting** merchant-scoped and abuse-oriented (exact limits TBD)
- **Idempotency** for financially consequential mutations
- **Payload validation** (schema/size/type constraints)
- **Replay resistance** where relevant (idempotency keys, webhook timestamps, session binding)
- **Request size limits**
- **Observability** for auth failures, rate limits and anomalous patterns without logging secrets
- **Suspicious activity detection** feeds Fraud Monitoring / Risk Engine where applicable

## Explicit non-goals for this phase

- final WAF / DDoS / API gateway vendor selection
- exhaustive threat signature catalogue
- published numeric rate-limit quotas
