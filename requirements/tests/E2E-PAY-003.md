---
id: E2E-PAY-003
title: Scheduled retry
type: e2e
status: specified
relatedRequirements:
  - FUN-PAY-006
relatedFlows:
  - scheduledRetry
relatedAdrs:
  - ADR-024
  - ADR-025
mvp: true
---

# E2E-PAY-003 — Scheduled retry

## Purpose

Eligible failure with no immediate fallback schedules a bounded retry (Orchestrator decides WHETHER; Retry Service WHEN per ADR-025).

## Preconditions

- Merchant and consumer fixtures connected; bill eligible for payment.
- Fake PSP returns scripted soft/retryable decline (or technical known no-charge).
- No eligible immediate backup (or TECHNICAL_ERROR path).
- Same-method retry budget remains (max 3 scheduled ordinals).

## Scenario

1. Primary (or current) attempt declines `RETRYABLE` (or `TECHNICAL_ERROR`).
2. Reliability Engine returns no immediate eligible fallback (RETRYABLE case).
3. Orchestrator transitions workflow → `RETRY_PENDING`.
4. D5 Retry Service schedules one durable `PaymentRetryDue` with `scheduledFor = completedAt + delay(ordinal)` where delays are **6h / 24h / 48h** for ordinals 1..3.
5. On due: Orchestrator reloads state, creates **new same-method** PaymentAttempt, emits `ExecutePaymentAttempt` command (no inline PSP in D5).

Also prove:

- retry budget exhausted → `ACTION_REQUIRED` (not FAILED while window open)
- duplicate / concurrent due → one attempt / one execute command
- UNKNOWN blocks schedule and due initiation
- stale COLLECTED/FAILED/CANCELLED due → no-op
- timezone conversion uses frozen merchant IANA TZ
- late due after cutoff → FAILED path (E2E-PAY-004) without new attempt

## Expected result

Workflow and attempt states match architecture; merchant/consumer outcomes consistent. No blind retry while UNKNOWN. Duplicate schedule/due handling idempotent.

## Implementation status

`specified`
