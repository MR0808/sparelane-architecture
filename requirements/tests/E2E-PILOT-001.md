---
id: E2E-PILOT-001
title: Fake-provider pilot end-to-end journey (Phase I1)
type: e2e
status: specified
implementationProgress: foundation_prerequisite
relatedRequirements:
  - NFR-OPS-001
  - NFR-OPS-004
relatedFlows: []
mvp: true
---

# E2E-PILOT-001 — Fake-provider pilot end-to-end journey

## Purpose

Phase **I1** evidence per [ADR-035](../../docs/decisions/ADR-035-pilot-readiness-local-evidence-policy.md): one Fake-provider journey covering bill → collect → ledger → settle → webhook → notification → admin inspect paths without live partners.

## Preconditions

- Phases A–H local Fake evidence available
- ADR-035 Option A
- I0 catalogue/checklist complete

## Scenario

Orchestrate Fake PSP / Fake settlement / Fake email journey and assert terminal states + FIN-INV cardinality expectations under local Fake.

## Expected result

Journey completes; financial invariants hold locally; no live-provider dependency.

## Implementation status

`specified` — **local Fake evidence PASS** on platform (`npm run test:phase-i1`). Not live-provider verified; FIN-INV none `product_verified`.
