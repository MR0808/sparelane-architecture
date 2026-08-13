# Recommended Repo Structure

Conceptual layout for `sparelane-platform` (do not create this repo here).

```text
sparelane-platform/
├── apps/
│   ├── web/                  # Consumer, Merchant, Admin, Hosted Flow
│   ├── api/                  # BFFs, Merchant API, provider webhook ingress
│   ├── payment-worker/
│   ├── settlement-worker/
│   └── notification-worker/
│
├── packages/
│   ├── domain/               # Domain modules & use-cases (no HTTP)
│   ├── db/                   # Prisma client, repos, transactional helpers
│   ├── ledger/               # Ledger write path only
│   ├── contracts/            # OpenAPI-derived types, webhook types, shared DTOs
│   ├── security/             # Authn/authz, hashing, signing helpers
│   ├── observability/        # Logging/metrics/traces conventions
│   ├── integrations/         # Provider adapter interfaces + implementations
│   └── config/               # Env/config loading (no secrets in code)
│
├── prisma/                   # Schema & migrations (implementation repo)
├── tests/                    # Integration / e2e / invariant suites
├── scripts/
├── docs/                     # Platform engineering notes (link back to architecture)
└── ...
```

## Responsibilities

| Path | Owns |
| --- | --- |
| `apps/web` | UI only; calls API/BFF; never authoritative financial state |
| `apps/api` | HTTP edge: auth, validation, command/query dispatch |
| `apps/*-worker` | Async consumers of durable work |
| `packages/domain` | Business rules, state machines, module APIs |
| `packages/ledger` | Sole writer of journal transactions/entries |
| `packages/integrations` | Vendor adapters behind interfaces |
| `packages/contracts` | Shared external/internal contract types |
| `prisma/` | Physical schema implementation of `docs/schema/` |
