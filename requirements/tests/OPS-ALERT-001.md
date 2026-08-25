---
id: OPS-ALERT-001
title: Phase I alert catalogue maps without inventing production thresholds
type: operations
status: specified
implementationProgress: foundation_prerequisite
relatedRequirements:
  - NFR-OPS-002
relatedFlows: []
mvp: true
---

# OPS-ALERT-001 — Alert catalogue mapping without production thresholds

## Purpose

Prove each binding alert *category* from [alerting](../../docs/operations/alerting.md) maps to an existing metric class, and that Phase I0 does not invent production numeric thresholds ([ADR-035](../../docs/decisions/ADR-035-pilot-readiness-local-evidence-policy.md)).

## Preconditions

- Alerting category list in architecture docs
- Platform metric catalogue / mapping artefact for I0

## Scenario

1. Load closed alert category catalogue.
2. Assert each category has a documented metric/signal mapping.
3. Assert production threshold fields are absent or explicitly marked TBD / non-authoritative.
4. Assert local CI hooks (if any) are labelled local-only.

## Expected result

Catalogue complete; no silent production threshold invention.

## Implementation status

`specified` — **local Fake evidence PASS** on platform (`npm run test:phase-i0`). Production thresholds remain TBD.
