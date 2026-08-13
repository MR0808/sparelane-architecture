---
id: E2E-PAY-003
title: Scheduled retry
type: e2e
status: specified
relatedRequirements:
  - FUN-PAY-006
relatedFlows:
  - scheduledRetry
mvp: true
---

# E2E-PAY-003 — Scheduled retry

## Purpose

Eligible failure schedules a bounded retry.

## Preconditions

- Merchant and consumer fixtures connected; bill eligible for payment.
- Fake PSP returns scripted outcomes.

## Scenario

Drive the `scheduledRetry` dynamic flow end-to-end.

## Expected result

Workflow and attempt states match architecture; merchant/consumer outcomes consistent.

## Implementation status

`specified`
