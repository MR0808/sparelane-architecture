---
id: NFR-REL-004
title: Dead-letter queue for poison messages
type: non-functional
area: reliability
status: accepted
implementationStatus: foundation_implemented
implementationEvidence: sparelane-platform/docs/development/phase-a-requirements.md
priority: must
mvp: true
architecture:
  - eventsArchitecture
flows:
  - dlqReplay
adrs:
  - ADR-017
contracts:
  - docs/operations/async-processing.md
modules:
  - Workers
tests:
  - OPS-REC-002
designs:
  - SEQ-OPS-003
---
# NFR-REL-004 — Dead-letter queue for poison messages

## Requirement

Poison or repeatedly failing messages must be routed to a DLQ with operable replay runbooks.

## Rationale

Reliability patterns from ADR-016/017 and financial invariants.

## Acceptance Criteria

- Behaviour is covered by financial invariant tests and/or resilience docs.
- Runbooks exist for operator response where applicable.

## Implementation evidence (Phase A)

`implementationStatus: foundation_implemented`. In-memory DLQ and unknown-outcome routing exist. Broker DLQ is OD-017. Product replay UI is not implemented.
