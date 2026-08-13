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
tests:
  - E2E-PAY-003
  - E2E-PAY-004
---

# Scheduled Retry

## Purpose

Soft/retryable failure with no immediate fallback: Retry Service schedules timing only; Payment Orchestrator later reloads state and creates a **new** Payment Attempt.

## Preconditions

- Attempt failed with soft/retryable classification.
- Reliability Engine confirms no immediate eligible fallback.
- Bounded retry budget remains.

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
    Dec-->>Orch: Soft / retryable
    Orch->>Rel: Immediate fallback?
    Rel-->>Orch: None eligible now
    Orch->>Retry: Schedule bounded retry
    Orch->>PSM: Transition to RETRY_PENDING
    Retry->>Bus: PaymentRetryScheduled

    Note over Retry: Retry Service schedules only — does not charge

    Retry->>Bus: PaymentRetryDue (when due)
    Bus->>Orch: Re-enter workflow
    Orch->>PSM: Reload state then PAYMENT_PENDING
    Orch->>Att: Create new payment attempt
    Orch->>Card: Execute scheduled retry attempt
```

## Important invariants

- Retry Service does not submit to PSP; Orchestrator owns attempts.
- Failed attempt is not mutated; due retry creates a new attempt.
- RETRY_PENDING → PAYMENT_PENDING is the legal re-entry (state schema).

## Failure notes

- Retry budget exhausted → FAILED (SEQ-PAY-006).
- Consumer/merchant intervention needed → ACTION_REQUIRED.

## Related

LikeC4: `scheduledRetry`. STATE-PAY-001 transitions.
