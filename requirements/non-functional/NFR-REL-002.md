---
id: NFR-REL-002
title: Safe worker restart
type: non-functional
area: reliability
status: accepted
priority: must
mvp: true
architecture:
  - productionDeployment
  - runtimeProcessing
flows: []
adrs:
  - ADR-017
  - ADR-016
contracts:
  - docs/implementation/workers.md
modules:
  - Workers
tests:
  - FIN-INV-10
---
# NFR-REL-002 — Safe worker restart

## Requirement

Worker restart must not create duplicate financial effects; in-flight work must resume safely.

## Rationale

Reliability patterns from ADR-016/017 and financial invariants.

## Acceptance Criteria

- Behaviour is covered by financial invariant tests and/or resilience docs.
- Runbooks exist for operator response where applicable.

## Notes

Numerical SLOs remain TBD where not yet decided.
