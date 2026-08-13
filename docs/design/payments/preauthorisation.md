---
id: SEQ-PAY-002
title: Pre-authorisation
type: sequence
area: payments
status: accepted
mvp: true
likec4:
  - preAuthorisation
requirements:
  - FUN-PAY-001
  - FUN-PAY-002
  - FUN-PAY-003
adrs:
  - ADR-001
  - ADR-002
  - ADR-003
tests:
  - E2E-PAY-001
  - INT-PSP-001
---

# Pre-authorisation

## Purpose

Early payment-method validation where the rail supports it. Pre-authorisation reduces later failure risk; it does **not** collect the bill.

## Preconditions

- Payment Workflow is SCHEDULED (or otherwise eligible for early check).
- An eligible payment method exists.
- Card Adapter / PSP supports pre-auth holds for the method.

## Mermaid

```mermaid
sequenceDiagram
    autonumber
    participant Sch as Bill Scheduler
    participant Orch as Payment Orchestrator
    participant PSM as Payment State Machine
    participant Rel as Reliability Engine
    participant Att as Payment Attempt Service
    participant Card as Card Adapter
    participant PSP as Card Adapter / PSP
    participant WH as Webhook Ingress

    Sch->>Orch: Early payment check due
    Orch->>PSM: Transition → PREAUTH_PENDING
    Orch->>Rel: Request first eligible method
    Rel-->>Orch: Primary method
    Orch->>Att: Create pre-auth attempt (CREATED)
    Orch->>Card: Request pre-authorisation
    Card->>PSP: Authorisation hold (no capture)
    Att->>Att: Attempt SUBMITTED

    PSP-->>WH: Authorisation result webhook
    WH-->>Orch: Verified provider event

    alt Pre-auth success
        Orch->>Att: Mark attempt AUTHORISED
        Orch->>PSM: Transition → PREAUTHORISED
        Note over Orch,PSM: PREAUTHORISED != COLLECTED — funds not collected
    else Soft / retryable failure
        Orch->>Att: Mark attempt DECLINED / ERROR (terminal for attempt)
        Orch->>PSM: → RETRY_PENDING or ACTION_REQUIRED
    else Proceed to collection path without hold
        Orch->>PSM: → PAYMENT_PENDING (product rules)
    end
```

## Important invariants

- Pre-auth success must not jump to COLLECTED.
- Attempt ends AUTHORISED without CAPTURED for pure pre-auth.
- Failed attempt rows are not rewritten; recovery creates a new attempt later.

## Failure notes

- Provider timeout → treat as unknown; reconcile before duplicate pre-auth (see SEQ-OPS-001).
- Hard decline may move workflow to ACTION_REQUIRED or FAILED per Reliability Engine rules.

## Related

LikeC4: `preAuthorisation`. State model: STATE-PAY-001 / STATE-PAY-002.
