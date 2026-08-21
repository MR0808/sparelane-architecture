---
id: E2E-PAY-005
title: Consumer Retry Now
type: e2e
status: specified
relatedRequirements:
  - FUN-CON-006
  - FUN-PAY-006
relatedFlows:
  - consumerRetryNow
relatedAdrs:
  - ADR-024
  - ADR-025
mvp: true
---

# E2E-PAY-005 — Consumer Retry Now

## Purpose

Eligible Retry Now creates a new attempt without duplicate collection, consuming the next ADR-025 scheduled ordinal and cancelling any pending ScheduledJob.

## Preconditions

- Merchant and consumer fixtures connected; bill eligible for payment.
- Workflow in `RETRY_PENDING` (with future ScheduledJob) or `ACTION_REQUIRED` with eligible method.
- Window open; no UNKNOWN pending; no in-flight attempt.
- Fake PSP returns scripted outcomes.

## Scenario

1. Consumer submits Retry Now with idempotency key.
2. Pending `PaymentRetryDue` job is cancelled/superseded.
3. Exactly one new PaymentAttempt is created; ExecutePaymentAttempt command emitted.
4. Duplicate Retry Now / concurrent click → one attempt.
5. Race: Retry Now vs scheduled due → one attempt.
6. Later original scheduled job → no-op.
7. Rejected when UNKNOWN pending, terminal states, or budget exhausted with no eligible method.

## Expected result

Workflow and attempt states match ADR-025; no extra budget; no duplicate provider-bound command from stale job.

## Implementation status

`specified` — **local FakePSP product evidence** exists in `sparelane-platform` (`tests/e2e/phase-d/`, `npm run test:phase-d`).

This is **not** `implementationProgress: product_verified` (schema reserved for real product/provider verification). Real PSP / sandbox verification has not been run.
