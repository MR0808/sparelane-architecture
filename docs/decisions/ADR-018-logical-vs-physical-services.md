# ADR-018 — Logical Services May Share Deployables

## Status

Accepted

## Context

The LikeC4 model contains many logical services for clarity of responsibility (orchestrator, retry, bill validation, etc.). Treating each as a mandatory independent microservice would create premature operational complexity.

## Decision

LikeC4 logical services express **responsibility boundaries** and do **not** imply one deployable per service.

Deployable units (Web/Experience, API Application, Payment Worker, Settlement Worker, Notification/Webhook Worker, Scheduler, Outbox Processor) may host multiple logical services.

## Consequences

### Positive

- prevents premature microservice proliferation
- allows modular monolith or coarse workers initially
- keeps architecture readable without forcing topology

### Negative / tradeoffs

- deployment docs must explicitly map logical → physical
- teams must still respect logical boundaries inside shared processes
- later splits remain possible when scaling/isolation demands

## Alternatives Considered

1. **One deployable per logical service** — rejected as default.
