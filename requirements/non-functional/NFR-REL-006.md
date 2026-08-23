---
id: NFR-REL-006
title: Durable dead-letter recovery evidence
type: non-functional
area: reliability
status: accepted
implementationStatus: designed
priority: must
mvp: true
architecture:
  - eventsArchitecture
flows:
  - dlqReplay
adrs:
  - ADR-017
  - ADR-034
contracts:
  - docs/operations/dead-letter-handling.md
modules:
  - Workers
  - Operations
tests:
  - ADM-DLQ-001
  - ADM-DLQ-002
  - OPS-REC-002
designs:
  - SEQ-OPS-003
---
# NFR-REL-006 — Durable dead-letter recovery evidence

## Requirement

Exhausted supported async work must leave durable `DeadLetterItem` evidence that survives worker/process restart. Manual webhook replay, when permitted, must be closed-catalogue and must not blind-repeat financial side effects.

## Rationale

Extends NFR-REL-004 from in-memory foundation to operator-durable evidence per ADR-034.

## Acceptance Criteria

- DLQ rows survive restart.
- Webhook exhaustion creates replayable durable evidence.
- Financial DLQ (if present) is non-replayable via generic operator replay.
- Replay does not claim exactly-once transport.
