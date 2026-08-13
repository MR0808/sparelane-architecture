# ADR-016 — Operational ↔ Ledger Consistency via Transactional Outbox

## Status

Accepted

## Context

After successful collection, Payment Workflow must become `COLLECTED` and exactly one financial journal must be posted. Operational DB and Ledger DB are logically separated ([ADR-013](./ADR-013-ledger-operational-separation.md)). Physical topology may be same cluster or separate databases ([docs/operations/database-topology.md](../operations/database-topology.md)).

Distributed two-phase commit across stores is undesirable. A single shared transactional boundary is not always available.

## Decision

Use **transactional outbox + idempotent ledger posting** as the default logical consistency pattern.

1. Operational transaction commits workflow state change (e.g. `COLLECTED`) **and** outbox event atomically
2. Outbox Processor publishes to the Event Bus (at-least-once)
3. Ledger consumer posts the journal **idempotently** by collection/workflow reference
4. System records financial posting confirmation
5. **Settlement must not become eligible until ledger posting is confirmed**

### Invariant

> Payment Workflow may briefly be `COLLECTED` before ledger posting completes, but the system must track and recover pending financial posting, ensure exactly one journal per successful collection, and block settlement eligibility until posting is confirmed.

Broker/database implementation details remain TBD.

## Consequences

### Positive

- works with separate or shared DB topologies
- avoids distributed transactions
- duplicate delivery tolerated via idempotent consumers
- aligns with existing outbox modelling
- recoverable after partial failure

### Negative / tradeoffs

- brief eventual-consistency window (`COLLECTED` without journal)
- requires posting-confirmation state and monitoring/alerts
- outbox processor becomes Tier-1 critical path

## Alternatives Considered

1. **Single transactional boundary** — optional optimisation if stores share a transaction; not the default assumption.
2. **Saga with compensation** — higher complexity; may still be used for other multi-step flows later.
