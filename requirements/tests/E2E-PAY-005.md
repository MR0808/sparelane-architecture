---
id: E2E-PAY-005
title: Consumer Retry Now
type: e2e
status: specified
relatedRequirements:
  - FUN-CON-006
relatedFlows:
  - consumerRetryNow
mvp: true
---

# E2E-PAY-005 — Consumer Retry Now

## Purpose

Eligible Retry Now creates a new attempt without duplicate collection.

## Preconditions

- Merchant and consumer fixtures connected; bill eligible for payment.
- Fake PSP returns scripted outcomes.

## Scenario

Drive the `consumerRetryNow` dynamic flow end-to-end.

## Expected result

Workflow and attempt states match architecture; merchant/consumer outcomes consistent.

## Implementation status

`specified`
