---
id: OPS-PILOT-001
title: Phase I local Fake-only pilot readiness boundary
type: operations
status: specified
implementationProgress: foundation_prerequisite
relatedRequirements:
  - NFR-OPS-001
  - NFR-OPS-002
  - NFR-OPS-004
relatedFlows: []
mvp: true
---

# OPS-PILOT-001 — Phase I local Fake-only pilot readiness boundary

## Purpose

Prove Phase I local evidence policy ([ADR-035](../../docs/decisions/ADR-035-pilot-readiness-local-evidence-policy.md)): readiness artefacts claim Fake-provider local scope only and do not claim live-partner sandbox, production MFA, hosted SIEM, or MVP complete.

## Preconditions

- ADR-035 Accepted
- Platform Phase I0 inventory / checklist present

## Scenario

1. Read Phase I readiness inventory / checklist.
2. Assert explicit Fake-provider / local-only scope statements.
3. Assert absence of claims that OD-008/009/023/024/025/035 are resolved by I0.
4. Assert H3+ admin mutations and financial corrections remain out of scope.

## Expected result

Boundary assertions pass; no invented live-sandbox or production-threshold claims.

## Implementation status

`specified` — **local Fake evidence PASS** on platform (`npm run test:phase-i0`, `phase-i-exit-gate.test.ts`). Does not mark NFR `verified` or resolve production ODs.
