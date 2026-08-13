---
id: NFR-REL-004
title: Dead-letter queue for poison messages
type: non-functional
area: reliability
status: accepted
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

## Notes

Numerical SLOs remain TBD where not yet decided.
