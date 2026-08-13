---
id: SEQ-SEC-003
title: Merchant API Authentication
type: sequence
area: security
status: accepted
mvp: true
likec4: []
requirements:
  - NFR-SEC-005
  - NFR-SEC-006
  - FUN-MER-003
adrs:
  - ADR-008
  - ADR-011
  - ADR-014
tests:
  - SEC-AUTH-001
  - SEC-TEN-001
  - INT-API-001
---

# Merchant API Authentication

## Purpose

Merchant machine authentication resolves a Bearer API key via hash/reference to merchant context and scopes, then authorises the request. Plaintext secrets are never stored.

## Preconditions

- Merchant issued an ACTIVE API credential (hash stored).
- Request includes `Authorization: Bearer …`.

## Mermaid

```mermaid
sequenceDiagram
    autonumber
    participant MBE as Merchant Backend
    participant API as Merchant API
    participant Keys as Merchant API Keys
    participant Authz as Authorization
    participant RL as Rate Limiter

    MBE->>API: Authenticated API request (Bearer key)
    API->>Keys: Verify credential hash / reference
    Note over Keys: No plaintext secret stored
    Keys-->>API: Merchant context + scopes
    API->>Authz: Authorise by scope and tenant
    alt Allowed
        Authz-->>API: Allow
        API->>RL: Merchant-scoped rate limit
        API-->>MBE: Proceed to handler
    else Denied
        Authz-->>API: Deny
        API-->>MBE: 401 / 403
    end
```

## Important invariants

- Only credential hashes/references stored (ADR-011).
- Tenant isolation enforced at authorisation (ADR-014).
- Distinct from merchant portal human sessions.

## Failure notes

- REVOKED / EXPIRED credentials fail auth.
- Scope mismatch fails even if key is valid.

## Related

LikeC4 dynamic view `merchantApiAuthentication`.
