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
relatedAdrs:
  - ADR-024
  - ADR-025
mvp: true
---

# E2E-PAY-004 — Complete failure

## Purpose

Terminal recovery exhaustion within the recovery window → `FAILED` (SEQ-PAY-006 / ADR-024 / ADR-025).

## Preconditions

- Merchant and consumer fixtures connected; bill eligible for payment.
- Fake PSP returns scripted declines as needed.
- Recovery window / cutoff closed (`now >= cutoffAt` where cutoff = dueDate + 7 days @ 09:00 frozen TZ) **or** other explicit FAILED trigger (not merely automatic method walk finished while window open).

## Scenario

1. Rel reports no eligible methods (or equivalent), **or** workflow is `RETRY_PENDING` / `ACTION_REQUIRED` past cutoff.
2. Cutoff processor / due handler reports window closed with ADR-025 guards clear (no UNKNOWN pending; no in-flight attempt).
3. Orchestrator transitions → `FAILED` and emits `PaymentFailed` **once**.
4. Contrast case (separate assertion): automatic walk + budget exhausted while window open → `ACTION_REQUIRED`, not `FAILED`.
5. Contrast: UNKNOWN pending at cutoff → **not** FAILED; no new charge.
6. Contrast: in-flight attempt at cutoff → **not** FAILED until resolved.

Also prove: late CAPTURED after `FAILED` does not silently overwrite to `COLLECTED` (financial-integrity / reconciliation condition).

## Expected result

Workflow terminal `FAILED`; no ledger collection posting; no settlement eligibility; merchant notified. Architecture states match ADR-024/025.

## Implementation status

`specified`
