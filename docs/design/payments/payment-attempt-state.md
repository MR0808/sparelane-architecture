---
id: STATE-PAY-002
title: Payment Attempt State Machine
type: state
area: payments
status: accepted
mvp: true
likec4:
  - paymentLifecycle
  - primaryCardSuccess
requirements:
  - FUN-PAY-003
  - FUN-PAY-004
  - FUN-PAY-005
adrs:
  - ADR-003
  - ADR-001
tests:
  - E2E-PAY-002
  - INT-PSP-001
  - FIN-INV-03
---

# Payment Attempt State Machine

## Purpose

State model for one concrete Payment Attempt against one method/rail. Retries and fallbacks create new attempts; terminal attempts are not rewritten to success.

## Preconditions

- Attempt belongs to an active Payment Workflow.
- Not every attempt visits every state (e.g. pre-auth may end AUTHORISED without CAPTURED).

## Mermaid

```mermaid
stateDiagram-v2
    [*] --> CREATED

    CREATED --> SUBMITTED
    CREATED --> CANCELLED

    SUBMITTED --> AUTHORISED
    SUBMITTED --> DECLINED
    SUBMITTED --> ERROR
    SUBMITTED --> CAPTURED
    SUBMITTED --> CANCELLED

    AUTHORISED --> CAPTURED
    AUTHORISED --> CANCELLED
    AUTHORISED --> DECLINED
    AUTHORISED --> ERROR

    DECLINED --> [*]
    ERROR --> [*]
    CAPTURED --> [*]
    CANCELLED --> [*]
```

## Important invariants

- DECLINED / ERROR / CAPTURED / CANCELLED are terminal for that attempt.
- Workflow COLLECTED requires a CAPTURED collection attempt (not mere AUTHORISED pre-auth).
- New recovery creates a new attempt row.

## Failure notes

- Unknown provider timeout: leave attempt non-terminal or ERROR only after reconcile policy; do not blind-duplicate (SEQ-OPS-001).

## Related

Schema: `docs/schema/state-transitions.md`. Workflow: STATE-PAY-001.
