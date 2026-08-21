---
id: FUN-PAY-007
title: Complete failure terminal state
type: functional
area: payments
status: accepted
implementationStatus: implemented
implementationEvidence: sparelane-platform/docs/development/phase-d-requirements.md
priority: must
mvp: true
architecture:
  - paymentEngineCore
flows:
  - completeFailure
adrs:
  - ADR-003
  - ADR-024
  - ADR-025
contracts: []
modules:
  - Payment Workflows
tests:
  - E2E-PAY-004
dependsOn: []
designs:
  - SEQ-PAY-006
---
# FUN-PAY-007 — Complete failure terminal state

## Requirement

When recovery is terminally exhausted within the recovery window (or another ADR-024 FAILED trigger), the payment workflow must reach a complete-failure terminal state and surface outcomes to merchants/consumers.

## Rationale

Terminal failure is required for honest outcomes (BUS-003).

## Acceptance Criteria

- Complete failure is distinct from in-progress, `ACTION_REQUIRED`, and collected states.
- Automatic exhaustion of methods/retry budget while the recovery window remains open yields `ACTION_REQUIRED`, not automatic `FAILED` ([ADR-024](../../docs/decisions/ADR-024-payment-recovery-ordering-and-exhaustion.md)).
- Recovery cutoff is `dueDate + 7 calendar days @ 09:00` frozen merchant TZ ([ADR-025](../../docs/decisions/ADR-025-payment-retry-timing-budget-and-recovery-window.md)).
- Cutoff does not mark `FAILED` while UNKNOWN reconciliation is pending or an attempt is in flight.
- Merchants can observe failure via API/webhooks when `FAILED` is reached; `PaymentFailed` emits once.

## Notes

Payment Reliability Engine MVP. Platform Phase D5 cutoff processing.

## Implementation evidence (Phase D)

`implementationStatus: implemented` for cutoff → FAILED terminal (FakePSP local). Merchant/consumer notification **delivery** is not implemented. Architecture `status` remains **accepted**. See [phase-d-status](../../docs/implementation/phase-d-status.md).
