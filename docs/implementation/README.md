# Implementation Blueprint

**Status:** Current  
**Owner:** Engineering (TBD)  
**Last Reviewed:** 2026-08-20  
**Related ADRs:** ADR-001–030 (via [traceability](architecture-traceability.md))  
**Related Views:** `10 Implementation /*`

Phase 9 engineering blueprint for `sparelane-platform`. **Does not** implement the product.

## Principles & repo

- [Implementation principles](implementation-principles.md)
- [Repository strategy](repository-strategy.md)
- [Technology baseline](technology-baseline.md)
- [Repo structure](repo-structure.md)

## Modules & deployables

- [Modules](modules.md)
- [Module dependencies](module-dependencies.md)
- [Deployable mapping](deployable-mapping.md)
- [Sync/async matrix](sync-async-matrix.md)

## Runtime correctness

- [Commands and events](commands-and-events.md)
- [Transaction boundaries](transaction-boundaries.md)
- [Database plan](database-plan.md)
- [Outbox blueprint](outbox-blueprint.md)
- [Workers](workers.md)
- [Concurrency](concurrency-blueprint.md)

## API, webhooks, ledger

- [API blueprint](api-blueprint.md)
- [Webhook blueprint](webhook-blueprint.md)
- [Ledger blueprint](ledger-blueprint.md)
- [Provider adapters](provider-adapters.md)

## Quality & delivery

- [Testing strategy](testing-strategy.md)
- [Financial invariant tests](financial-invariant-tests.md)
- [Configuration](configuration.md) · [Feature flags](feature-flags.md)
- [CI/CD](ci-cd.md) · [Environments](environments.md)
- [Observability conventions](observability-conventions.md)
- [Error taxonomy](error-taxonomy.md)

## Build plan & acceptance

- [Implementation status](implementation-status.md) — designed vs foundation vs product vs verified
- [Phase A status](phase-a-status.md) — platform foundation gate
- [Phase B status](phase-b-status.md) — merchant + consumer core gate (no money movement)
- [Phase C status](phase-c-status.md) — bill ingestion gate (no money movement)
- [Phase D status](phase-d-status.md) — payment reliability (FakePSP)
- [Phase F status](phase-f-status.md) — settlement (local Fake; not real money)
- [Phase G status](phase-g-status.md) — notifications & webhooks (local sink + Fake email)
- [Phase H status](phase-h-status.md) — security / admin hardening (H0–H2 PASS local)
- [Phase I status](phase-i-status.md) — pilot readiness (I0–I3 **PASS** local Fake evidence; external ODs open)
- [Build phases A–I](build-phases.md)
- [MVP acceptance criteria](mvp-acceptance-criteria.md) — **NOT ACCEPTED — EXTERNAL BLOCKERS** (**4**); [gap plan](mvp-acceptance-gap-plan.md)
- [Architecture traceability](architecture-traceability.md)

Portal: [START-HERE](../START-HERE.md) · [Architecture map](../architecture-map.md).
