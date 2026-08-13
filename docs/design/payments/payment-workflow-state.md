---
id: STATE-PAY-001
title: Payment Workflow State Machine
type: state
area: payments
status: accepted
mvp: true
likec4:
  - paymentLifecycle
requirements:
  - FUN-PAY-001
  - FUN-PAY-004
  - FUN-PAY-007
  - FUN-PAY-008
adrs:
  - ADR-002
  - ADR-003
  - ADR-005
tests:
  - E2E-PAY-001
  - E2E-PAY-004
  - FIN-INV-02
---

# Payment Workflow State Machine

## Purpose

Authoritative legal transitions for Payment Workflow lifecycle. Aligns with `docs/schema/state-transitions.md` and `docs/payments/payment-state-machine.md`.

## Preconditions

- Transitions occur only through Payment Orchestrator / Payment State Machine domain paths.
- Settlement is a separate lifecycle; COLLECTED does not imply SETTLED.

## Mermaid

```mermaid
stateDiagram-v2
    [*] --> CREATED

    CREATED --> SCHEDULED
    CREATED --> CANCELLED

    SCHEDULED --> PREAUTH_PENDING
    SCHEDULED --> PAYMENT_PENDING
    SCHEDULED --> CANCELLED

    PREAUTH_PENDING --> PREAUTHORISED
    PREAUTH_PENDING --> RETRY_PENDING
    PREAUTH_PENDING --> ACTION_REQUIRED
    PREAUTH_PENDING --> PAYMENT_PENDING
    PREAUTH_PENDING --> FAILED
    PREAUTH_PENDING --> CANCELLED

    PREAUTHORISED --> PAYMENT_PENDING
    PREAUTHORISED --> CANCELLED

    PAYMENT_PENDING --> COLLECTED
    PAYMENT_PENDING --> RETRY_PENDING
    PAYMENT_PENDING --> ACTION_REQUIRED
    PAYMENT_PENDING --> FAILED
    PAYMENT_PENDING --> CANCELLED

    RETRY_PENDING --> PAYMENT_PENDING
    RETRY_PENDING --> ACTION_REQUIRED
    RETRY_PENDING --> FAILED
    RETRY_PENDING --> CANCELLED

    ACTION_REQUIRED --> PAYMENT_PENDING
    ACTION_REQUIRED --> RETRY_PENDING
    ACTION_REQUIRED --> FAILED
    ACTION_REQUIRED --> CANCELLED

    COLLECTED --> [*]
    FAILED --> [*]
    CANCELLED --> [*]
```

## Important invariants

- Invalid examples: FAILED→COLLECTED, CREATED→COLLECTED, COLLECTED→PAYMENT_PENDING, PREAUTHORISED→COLLECTED.
- On COLLECTED set `ledger_posting_status = PENDING` (outbox path).
- Settlement eligibility requires `ledger_posting_status = CONFIRMED`.

## Failure notes

- Reject illegal transitions in domain logic; never via raw admin DB update.
- Pre-auth success must not skip to COLLECTED.

## Related

Schema: `docs/schema/state-transitions.md`. Attempt machine: STATE-PAY-002.
