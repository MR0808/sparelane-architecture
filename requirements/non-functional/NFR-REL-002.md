---
id: NFR-REL-002
title: Safe worker restart
type: non-functional
area: reliability
status: accepted
implementationStatus: foundation_implemented
implementationEvidence: sparelane-platform/docs/development/phase-a-requirements.md
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
  - OPS-REC-001
---
# NFR-REL-002 — Safe worker restart

## Requirement

Worker restart must not create duplicate financial effects; in-flight work must resume safely.

## Rationale

Reliability patterns from ADR-016/017 and financial invariants.

## Acceptance Criteria

- Behaviour is covered by financial invariant tests and/or resilience docs.
- Runbooks exist for operator response where applicable.

## Implementation evidence (Phase A)

`implementationStatus: foundation_implemented`. Worker restart + redelivery on a non-financial fixture. FIN-INV-10 is not a verified financial E2E.
