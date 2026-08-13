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
tests:
  - E2E-PAY-005
  - CON-API-001
---

# Consumer Retry Now

## Purpose

Consumer-initiated manual retry: authenticate, validate workflow eligibility, create a new attempt, and protect duplicate concurrent clicks with idempotency.

## Preconditions

- Consumer is authenticated to Consumer Web / BFF.
- Workflow is in ACTION_REQUIRED or RETRY_PENDING (or other product-allowed retryable state).
- At least one eligible payment method exists.

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
    participant Att as Payment Attempt Service
    participant Card as Card Adapter
    participant PSP as Card Adapter / PSP

    C->>Web: Opens payment issue → Retry now
    Web->>BFF: Submit manual retry command (+ idempotency key)
    BFF->>BFF: Authenticate session
    BFF->>Orch: Request manual retry

    Orch->>PSM: Validate workflow allows retry
    alt Not eligible
        Orch-->>BFF: Reject (wrong state / exhausted)
        BFF-->>Web: Error
    else Eligible
        Orch->>Orch: Idempotency — duplicate click?
        alt Duplicate in-flight / completed key
            Orch-->>BFF: Replay existing result
        else New retry
            Orch->>Rel: Eligible method
            Rel-->>Orch: Method selected
            Orch->>Att: Create new payment attempt
            Orch->>Card: Initiate payment
            Card->>PSP: Authorise / capture
            PSP-->>Orch: Result (via verified webhook path)
            Orch-->>BFF: Outcome
        end
    end
```

## Important invariants

- Manual retry creates a new Payment Attempt; does not mutate prior terminal attempts.
- Duplicate concurrent Retry Now must be idempotent (same key → same outcome).
- Auth failure never reaches Orchestrator mutation.

## Failure notes

- Soft decline after Retry Now may re-enter RETRY_PENDING / ACTION_REQUIRED.
- Hard exhaustion → FAILED (SEQ-PAY-006).

## Related

LikeC4: `consumerRetryNow`. FUN-CON-006.
