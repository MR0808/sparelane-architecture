# ADR-002 — Dedicated Payment Orchestrator

## Status

Accepted

## Context

Payment reliability requires coordinated behaviour across method selection, pre-authorisation, provider attempts, decline classification, fallback, retries, ledgering after collection, and lifecycle events.

If this logic is spread across API controllers, adapters, schedulers and webhook handlers, state transitions become inconsistent and recovery paths diverge.

## Decision

Use a dedicated logical **Payment Orchestrator** to coordinate payment reliability workflows.

The orchestrator:

- receives payment workflow commands/events
- consults Payment State Machine, Reliability Engine, Decline Classification and Retry Service
- initiates attempts through rail adapters
- emits payment lifecycle events
- determines `COLLECTED` vs `RETRY_PENDING` vs `ACTION_REQUIRED` vs terminal `FAILED` using [ADR-024](./ADR-024-payment-recovery-ordering-and-exhaustion.md)

The orchestrator is **not**:

- the PSP
- the ledger
- the settlement service
- the notification provider
- the method-selection engine
- the retry scheduler

## Consequences

### Positive

- consistent state transition handling
- clearer fallback/retry coordination
- auditable workflow decisions in one place
- reduced duplicated recovery logic across entry points

### Negative / tradeoffs

- risk of the orchestrator becoming an overly central “god” service if responsibilities leak
- requires deliberate interfaces so adapters and schedulers stay narrow
- operational criticality is concentrated and must be observed carefully

## Alternatives Considered

1. **Distribute workflow logic across bill scheduler, webhook handlers and adapters** — rejected; leads to divergent state handling.
2. **Fully choreograph via events only with no orchestrator** — rejected for MVP; payment collection needs explicit guarded transitions and idempotent command handling.
3. **Let Retry Service own recovery decisions** — rejected; scheduling must stay separate from orchestration.
