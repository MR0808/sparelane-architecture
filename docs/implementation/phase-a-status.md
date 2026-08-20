# Phase A — Platform Foundation

**Status:** Current  
**Owner:** Engineering / Architecture  
**Last Reviewed:** 2026-08-20  
**Related ADRs:** ADR-011–014, ADR-016–022  
**Related Views:** `10 Implementation /*`

## Status

**PASS WITH DOCUMENTED NON-BLOCKING RISKS**

Recorded from `sparelane-platform` Phase A exit evidence. This is a **platform foundation** gate, not MVP product acceptance.

## Purpose

Phase A established the technical foundation required for subsequent product implementation (Phase B onward). It proved that repository, configuration, persistence, module boundaries, API runtime, outbox/queue, workers, observability, audit, and provider ports work together.

It did **not** implement Sparelane product workflows.

`FoundationOperation` in the platform repo is an infrastructure/test-only fixture. It is **not** a Bill, Payment, Settlement, Consumer, or Merchant product capability. Do not show it as such in this portal.

## A0–A9 summary

| Phase | Purpose | Key capability delivered | Evidence (platform) | Status |
| --- | --- | --- | --- | --- |
| A0 | Repository / monorepo | npm workspaces, Node 22, CI scaffold | `README.md`; `.github/workflows/ci.yml` | PASS |
| A1 | Configuration | Typed config, fail-fast env, secret wrapping | `@sparelane/config` | PASS |
| A2 | Persistence | PostgreSQL/Prisma; operational/ledger/audit schemas; migrations | `@sparelane/database`; `db:migrate:test:from-zero` | PASS |
| A3 | Domain boundaries | Module public entries; persistence ownership | `architecture:check` | PASS |
| A4 | API runtime | Fastify context, deny-by-default, errors, security headers | `apps/api` | PASS |
| A5 | Async/events | Domain events, transactional outbox, in-memory queue, idempotent consumers | `@sparelane/events`, `outbox`, `queue` | PASS |
| A6 | Workers/scheduling | WorkerRuntime, durable scheduler, leases, drain | worker apps; scheduler tests | PASS |
| A7 | Observability | Logs, traces, metrics, audit, redaction | `@sparelane/observability` | PASS |
| A8 | Provider abstraction | Ports + deterministic fakes; no real vendors | `@sparelane/integrations`; `adapters:test` | PASS |
| A9 | Integration exit gate | Synthetic end-to-end foundation proof | `tests/e2e/foundation`; `docs/development/phase-a-exit-gate.md` | PASS |

Canonical architecture Phase A (this repo) remains the coarse “platform foundation” phase in [build-phases](build-phases.md). A0–A9 are the platform’s recorded sub-phases of that work.

## Foundation capabilities now implemented

Grouped by concern. All are **foundation implemented**, not product verified.

### Repository / quality

Modular monorepo; typecheck/lint/format; architecture boundary checks; production builds without `tsx`; CI (`npm ci`, migrate, validate, integration, foundation E2E, build, smoke, coverage).

### Configuration

Typed environment config; fail-fast invalid env; `SecretString` wrapping; no secrets in git.

### Persistence

Reproducible Prisma migrations (including from a clean test database); logical operational / ledger / audit schemas; `withTransaction`; merchant-scoped query conventions.

### Domain boundaries

Apps do not import Prisma; modules use public entries; shared packages do not import domain modules; testing fakes absent from the production graph.

### API runtime

Request/correlation IDs; fake/static principal for tests; body limits; CORS disabled by default; JSON errors; `/health` and `/ready`; production construction does not register `/__test__` fixture routes.

### Async / event processing

Transactional outbox (fixture + event atomic; rollback); publisher; in-memory queue; event envelopes; causation on follow-up events; crash window before `publishedAt` remains recoverable.

### Workers / scheduling

Real `WorkerRuntime`; idempotent consumer + durable `ProcessedEvent`; concurrency; graceful drain and drain-timeout; PostgreSQL-backed scheduler (future dispatch, restart survival, terminal FAILED dispatch); `WorkLease` contention and expiry recovery.

### Observability

Structured logs; in-process traces/metrics; correlation vs trace identity; no high-cardinality metric labels.

### Security / audit

Tenant isolation on foundation queries; spoofed merchant header cannot override principal tenant; redaction of secrets/CHD-shaped fields; append-only audit; security events.

### Provider abstraction

Provider ports and deterministic fakes. Synthetic proof used object-storage, not payment semantics. No real PSP, bank, IdP, or broker.

### Integration proof (A9)

Synthetic path only:

HTTP API → request/correlation/security context → application transaction → persistence → transactional outbox → publisher → queue → WorkerRuntime → idempotent consumer → provider port / fake → persistence update → follow-up event → audit → logs / metrics / traces.

Also: transaction rollback; duplicate publication/delivery; worker restart/redelivery; bounded technical retries; unknown external outcome → reconciliation signal, no blind retry; scheduler and lease proofs; compiled Node entrypoints; CI foundation tests.

## Explicitly NOT implemented

- Real authentication / identity-provider integration
- Merchant onboarding product workflow
- Consumer onboarding product workflow
- Bill submission behaviour
- Payment orchestration
- Payment state machine behaviour
- Reliability method selection
- PSP payment execution
- Ledger posting
- Wallet behaviour
- Settlement
- Reconciliation (product)
- Merchant webhook product delivery
- Production broker
- Production provider integrations
- Production infrastructure topology
- MVP acceptance criteria in [mvp-acceptance-criteria](mvp-acceptance-criteria.md)

## Non-blocking risks / deferred decisions

### A. Prisma CLI dependency advisory

High-severity `deepmerge-ts` advisory via `deepmerge-ts` ← `@prisma/config` ← Prisma CLI (7.9.x). It is on the **CLI/config** path, not described here as a runtime payment vulnerability. `npm audit fix --force` would downgrade Prisma to 6.x and is **not** applied. **Known / accepted for continued development / monitor for upstream fix.** Not resolved.

### B. Production broker remains TBD

Queue **abstraction** is implemented. Local foundation uses an **in-memory** queue. That is not production durable infrastructure (OD-017).

### C. Scheduler implementation is not necessarily final infrastructure

Durable scheduling foundation currently uses PostgreSQL-backed jobs. Managed scheduler / broker-delay alternatives remain possible. This does **not** create a new ADR.

### D. Physical DB topology remains open

Logical operational / ledger / audit separation exists (ADR-013). Development PostgreSQL topology is not the final production topology (OD-019).

### E. External vendors remain open

PSP, settlement/banking partner, identity provider, production secrets/KMS, production broker, observability/SIEM products, cloud — see [open decisions](../decisions/open-decisions.md). These do **not** block local Phase B where fakes/stubs are permitted by [build-phases](build-phases.md).

### F. Financial invariant verification

Foundation necessary for safe financial processing exists. Real payment → ledger → settlement behaviour has **not** been implemented. **FIN-INV-01–08 must not be marked verified.** FIN-INV-09/10 have foundation prerequisites only, not executable financial E2E.

## Next phase

[Phase B — Merchant + Consumer Core](build-phases.md) is **PASS WITH DOCUMENTED NON-BLOCKING RISKS** — see [phase-b-status](phase-b-status.md). [Phase C — Bill Ingestion](build-phases.md) is **NOT STARTED**.

## Platform evidence (do not copy)

- `sparelane-platform/docs/development/phase-a-exit-gate.md`
- `sparelane-platform/docs/development/phase-a-traceability.md`
- `sparelane-platform/docs/development/phase-a-requirements.md`
- `sparelane-platform/docs/development/open-decision-blockers.md`
- `sparelane-platform/tests/e2e/foundation/`
