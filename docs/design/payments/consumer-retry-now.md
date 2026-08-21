---
id: SEQ-PAY-007
title: Consumer Retry Now
type: sequence
area: payments
status: accepted
mvp: true
likec4:
  - consumerRetryNow
requirements:
  - FUN-CON-006
  - FUN-PAY-006
  - FUN-PAY-007
adrs:
  - ADR-002
  - ADR-003
  - ADR-017
  - ADR-024
  - ADR-025
tests:
  - E2E-PAY-005
  - CON-API-001
---

# Consumer Retry Now

## Purpose

Consumer-initiated manual retry: authenticate, validate workflow eligibility, create a new attempt, and protect duplicate concurrent clicks with idempotency.

**D5 MVP scope:** included. Budget semantics per [ADR-025](../../decisions/ADR-025-payment-retry-timing-budget-and-recovery-window.md): Retry Now **accelerates the next already-permitted scheduled ordinal**, consumes it, and cancels/supersedes the pending `ScheduledJob`. It does **not** grant extra attempts beyond max 3 per method.

## Preconditions

- Consumer is authenticated to Consumer Web / BFF.
- Workflow is in `RETRY_PENDING` or `ACTION_REQUIRED`.
- Recovery window open (`now < cutoffAt`).
- At least one eligible payment method exists (Rel).
- No UNKNOWN / reconciliation-pending attempt.
- No attempt currently in flight.

## Mermaid

```mermaid
sequenceDiagram
    autonumber
    participant C as Consumer
    participant Web as Consumer Web
    participant BFF as Consumer BFF
    participant Orch as Payment Orchestrator
    participant PSM as Payment State Machine
    participant Rel as Reliability Engine
    participant Retry as Retry Service
    participant Att as Payment Attempt Service
    participant Card as Card Adapter

    C->>Web: Opens payment issue → Retry now
    Web->>BFF: Submit manual retry command (+ idempotency key)
    BFF->>BFF: Authenticate session
    BFF->>Orch: Request manual retry

    Orch->>PSM: Validate workflow allows retry
    alt Not eligible
        Orch-->>BFF: Reject (wrong state / exhausted / unknown / in-flight)
        BFF-->>Web: Error
    else Eligible
        Orch->>Orch: Idempotency — duplicate click?
        alt Duplicate in-flight / completed key
            Orch-->>BFF: Replay existing result
        else New retry
            Orch->>Retry: Cancel/supersede pending PaymentRetryDue job
            Orch->>Rel: Eligible method
            Rel-->>Orch: Method selected
            Orch->>Att: Create new payment attempt (consumes ordinal)
            Orch->>Card: Dispatch ExecutePaymentAttempt
            Orch-->>BFF: Outcome accepted / in progress
        end
    end
```

## Important invariants

- Manual retry creates a new Payment Attempt; does not mutate prior terminal attempts.
- Duplicate concurrent Retry Now must be idempotent (same key → same outcome).
- Auth failure never reaches Orchestrator mutation.
- Race with scheduled due: exactly one attempt (D1 one-in-flight + job cancel + OCC).
- Does not bypass UNKNOWN reconciliation.
- Does not reset/extend recovery cutoff.

## Failure notes

- Soft decline after Retry Now may re-enter RETRY_PENDING / ACTION_REQUIRED under ADR-024/025.
- Cutoff closed → FAILED (SEQ-PAY-006), not Retry Now.

## Related

LikeC4: `consumerRetryNow`. FUN-CON-006. ADR-025.
