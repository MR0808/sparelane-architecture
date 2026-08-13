---
id: E2E-PAY-004
title: Complete failure
type: e2e
status: specified
relatedRequirements:
  - FUN-PAY-007
  - BUS-003
relatedFlows:
  - completeFailure
mvp: true
---

# E2E-PAY-004 — Complete failure

## Purpose

All methods/retries exhausted → terminal failure.

## Preconditions

- Merchant and consumer fixtures connected; bill eligible for payment.
- Fake PSP returns scripted outcomes.

## Scenario

Drive the `completeFailure` dynamic flow end-to-end.

## Expected result

Workflow and attempt states match architecture; merchant/consumer outcomes consistent.

## Implementation status

`specified`
