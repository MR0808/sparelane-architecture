---
id: NFR-REL-001
title: Idempotent async consumers
type: non-functional
area: reliability
status: accepted
implementationStatus: foundation_implemented
implementationEvidence: sparelane-platform/docs/development/phase-a-requirements.md
priority: must
mvp: true
architecture:
  - eventsArchitecture
  - productionDeployment
flows:
  - dlqReplay
adrs:
  - ADR-017
contracts:
  - docs/operations/async-processing.md
modules:
  - Workers
  - Outbox
tests:
  - FIN-INV-09
  - OPS-REC-001
---
# NFR-REL-001 — Idempotent async consumers

## Requirement

Async consumers must be idempotent so at-least-once delivery cannot create duplicate financial effects.

## Rationale

Reliability patterns from ADR-016/017 and financial invariants.

## Acceptance Criteria

- Behaviour is covered by financial invariant tests and/or resilience docs.
- Runbooks exist for operator response where applicable.

## Implementation evidence (Phase A)

`implementationStatus: foundation_implemented`. Durable `ProcessedEvent` + duplicate delivery on a non-financial fixture. FIN-INV-09 is not a verified financial E2E.

## Notes

Numerical SLOs remain TBD where not yet decided.
