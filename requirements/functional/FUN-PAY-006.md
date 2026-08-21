---
id: FUN-PAY-006
title: Scheduled retry
type: functional
area: payments
status: accepted
priority: must
mvp: true
architecture:
  - paymentEngineCore
flows:
  - scheduledRetry
adrs:
  - ADR-002
  - ADR-017
  - ADR-024
  - ADR-025
contracts: []
modules:
  - Reliability Engine
  - Workers
tests:
  - E2E-PAY-003
dependsOn: []
openDecisions: []
designs:
  - SEQ-PAY-005
---
# FUN-PAY-006 — Scheduled retry

## Requirement

Sparelane must support scheduled retries for retry-eligible payment failures within bounded policy.

## Rationale

Scheduled retries complement Retry Now and fallback.

## Acceptance Criteria

- Retries are bounded per [ADR-025](../../docs/decisions/ADR-025-payment-retry-timing-budget-and-recovery-window.md): max **3** same-method scheduled ordinals; delays **+6h / +24h / +48h**; shared RETRYABLE/TECHNICAL budget; no quiet hours in MVP.
- Orchestrator decides **whether** `RETRY_PENDING` applies ([ADR-024](../../docs/decisions/ADR-024-payment-recovery-ordering-and-exhaustion.md)); Retry Service decides **when** (ADR-025).
- Scheduled retry does not bypass duplicate-collection protections.
- Same-method scheduled retry is used when no immediate eligible backup remains (RETRYABLE) or for known no-charge TECHNICAL_ERROR — not while UNKNOWN reconciliation is pending.
- Durable `ScheduledJob` / `PaymentRetryDue` with stable logical identity; duplicate due handling creates one attempt.

## Notes

Payment Reliability Engine MVP. Platform Phase D5.
