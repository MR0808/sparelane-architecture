---
id: SEQ-PAY-005
title: Scheduled Retry
type: sequence
area: payments
status: accepted
mvp: true
likec4:
  - scheduledRetry
requirements:
  - FUN-PAY-006
  - FUN-PAY-007
  - NFR-REL-001
adrs:
  - ADR-002
  - ADR-003
  - ADR-024
  - ADR-025
tests:
  - E2E-PAY-003
  - E2E-PAY-004
---

# Scheduled Retry

## Purpose

Soft/retryable failure with no immediate fallback (or technical known no-charge per [ADR-024](../../decisions/ADR-024-payment-recovery-ordering-and-exhaustion.md)): Orchestrator decides **RETRY_PENDING**; Retry Service schedules timing only per [ADR-025](../../decisions/ADR-025-payment-retry-timing-budget-and-recovery-window.md); Payment Orchestrator later reloads state and creates a **new** Payment Attempt.

## Preconditions

- Attempt failed with `RETRYABLE` classification (or `TECHNICAL_ERROR` known no-charge).
- For RETRYABLE: Reliability Engine confirms no immediate eligible fallback.
- Bounded same-method retry budget remains (ADR-025: max 3 scheduled ordinals 1..3).

## Mermaid

```mermaid
sequenceDiagram
    autonumber
    participant Orch as Payment Orchestrator
    participant Card as Card Adapter
    participant PSP as Card Adapter / PSP
    participant WH as Webhook Ingress
    participant Dec as Decline Service
    participant Rel as Reliability Engine
    participant Retry as Retry Service
    participant PSM as Payment State Machine
    participant Att as Payment Attempt Service
    participant Bus as Event Bus

    Orch->>Card: Submit payment attempt
    Card->>PSP: Authorise / capture
    PSP-->>WH: Soft / retryable decline
    WH-->>Orch: Verified provider event
    Orch->>Dec: Classify
    Dec-->>Orch: RETRYABLE
    Orch->>Rel: Immediate fallback?
    Rel-->>Orch: None eligible now
    Note over Orch: ADR-024 - decide WHETHER retry - ADR-025 decides WHEN (6h/24h/48h)
    Orch->>PSM: Transition to RETRY_PENDING
    Orch->>Retry: Schedule bounded retry (D5)
    Retry->>Bus: PaymentRetryScheduled

    Note over Retry: Retry Service schedules only — does not charge

    Retry->>Bus: PaymentRetryDue (when due)
    Bus->>Orch: Re-enter workflow
    Orch->>PSM: Reload state then PAYMENT_PENDING
    Orch->>Att: Create new payment attempt
    Orch->>Card: Dispatch ExecutePaymentAttempt (not inline PSP)
```

## Important invariants

- Retry Service does not submit to PSP; Orchestrator owns attempts.
- Failed attempt is not mutated; due retry creates a new attempt.
- RETRY_PENDING → PAYMENT_PENDING is the legal re-entry (state schema).
- Decline Classification does not call Retry Service.

## Failure notes

- Retry budget exhausted while recovery window open → `ACTION_REQUIRED` (ADR-024).
- Recovery window / cutoff exhausted (`cutoffAt`, ADR-025) → FAILED (SEQ-PAY-006), unless UNKNOWN/in-flight guards block.
- Consumer/merchant intervention needed without remaining automatic retry → `ACTION_REQUIRED`.

## Related

LikeC4: `scheduledRetry`. STATE-PAY-001 transitions. ADR-024. ADR-025.
