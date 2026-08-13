# API Implementation Blueprint

Source of truth: [`contracts/openapi.yaml`](../../contracts/openapi.yaml).

## Request path

```text
HTTP
→ authentication (Bearer merchant API key / session)
→ merchant / actor context
→ authorisation (scopes, tenant)
→ validation (Zod ↔ OpenAPI)
→ application command/query
→ domain module
→ persistence
→ response
```

## Rules

- Route handlers **must not** contain core payment/ledger/settlement logic
- `POST /v1/bills` requires `Idempotency-Key`; response is **accepted ≠ collected**
- Opaque public IDs only ([ADR-020](../decisions/ADR-020-opaque-public-identifiers.md))
- Money as decimal strings ([ADR-021](../decisions/ADR-021-money-representation.md))
- Errors use the OpenAPI error model (no stack traces)
- Generate/propagate `X-Request-Id`
