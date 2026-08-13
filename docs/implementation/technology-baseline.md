# Technology Baseline

Vendor-neutral but practical baseline for `sparelane-platform`. Do not lock open-decision vendors.

| Category | Recommendation | Notes |
| --- | --- | --- |
| Language | **TypeScript** | Application and backend services |
| Web | **Next.js App Router** | Consumer, Merchant, Admin, Hosted Flow (consistent with project direction) |
| Backend runtime | **Node.js + TypeScript** | API and workers |
| Database | **PostgreSQL**-compatible | Operational + ledger logical stores |
| DB access | **Prisma** | Aligns with broader project standards; schema follows `docs/schema/` |
| Validation | **Zod** (or equivalent) | Request/command validation; mirror OpenAPI |
| HTTP API | **REST/JSON** | Source of truth: `contracts/openapi.yaml` |
| Async | Queue/event **abstraction** | Broker vendor TBD ([open decisions](../decisions/open-decisions.md)) |
| Object storage | **S3-compatible** abstraction | Evidence/exports |
| Email/SMS | Adapter interfaces | Provider TBD |
| Observability | **OpenTelemetry**-compatible | Vendor TBD |
| Secrets | Central managed store | Product TBD ([ADR-011](../decisions/ADR-011-centralised-secrets-management.md)) |

Preserve Accepted ADR constraints (opaque IDs, decimal-safe money, outbox, tenant isolation, PCI boundary).
