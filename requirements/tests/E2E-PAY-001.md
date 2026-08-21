---
id: E2E-PAY-001
title: Primary payment success
type: e2e
status: specified
relatedRequirements:
  - FUN-PAY-001
  - FUN-PAY-003
relatedFlows:
  - primaryCardSuccess
mvp: true
---

# E2E-PAY-001 — Primary payment success

## Purpose

Bill pays successfully via primary method.

## Preconditions

- Merchant and consumer fixtures connected; bill eligible for payment.
- Fake PSP returns scripted outcomes.

## Scenario

Drive the `primaryCardSuccess` dynamic flow end-to-end.

## Expected result

Workflow and attempt states match architecture; merchant/consumer outcomes consistent.

## Implementation status

`specified` — **local FakePSP product evidence** exists in `sparelane-platform` (`tests/e2e/phase-d/`, `npm run test:phase-d`).

This is **not** `implementationProgress: product_verified` (schema reserved for real product/provider verification). Real PSP / sandbox verification has not been run.
