---
id: SEQ-PAY-004
title: Backup Recovery
type: sequence
area: payments
status: accepted
mvp: true
likec4:
  - backupRecovery
requirements:
  - FUN-PAY-004
  - FUN-PAY-005
  - FUN-PAY-006
adrs:
  - ADR-002
  - ADR-003
  - ADR-024
tests:
  - E2E-PAY-002
  - E2E-PAY-003
---

# Backup Recovery

## Purpose

Primary card fails with a classifiable decline; per [ADR-024](../../decisions/ADR-024-payment-recovery-ordering-and-exhaustion.md) Orchestrator excludes the current method from immediate selection when appropriate; Reliability Engine selects the next eligible backup; a **new** Payment Attempt succeeds. The failed attempt is not mutated into success.

## Preconditions

- Workflow is PAYMENT_PENDING (or recovering within the same due window).
- Primary attempt has a terminal failure (`DECLINED`) classified `RETRYABLE` or `NON_RETRYABLE`.
- At least one backup method remains eligible for the immediate walk.

## Mermaid

```mermaid
sequenceDiagram
    autonumber
    participant Orch as Payment Orchestrator
    participant Att as Payment Attempt Service
    participant Card as Card Adapter
    participant PSP as Card Adapter / PSP
    participant WH as Webhook Ingress
    participant Dec as Decline Service
    participant Rel as Reliability Engine
    participant PSM as Payment State Machine
    participant OB as Outbox Publisher

    Orch->>Att: Create primary attempt
    Orch->>Card: Attempt primary card
    Card->>PSP: Authorise / capture
    PSP-->>WH: Decline
    WH-->>Orch: Verified PaymentDeclined
    Orch->>Att: Mark primary attempt DECLINED
    Note over Att: Failed attempt is terminal — do not mutate to CAPTURED

    Orch->>Dec: Classify decline
    Dec-->>Orch: RETRYABLE or NON_RETRYABLE
    Orch->>Att: Attach classification write-once if needed
    Note over Orch: ADR-024 - soft exclude from immediate walk - hard workflow-scoped exclude
    Orch->>Rel: Next eligible method (with exclusions)
    Rel-->>Orch: Backup card

    Orch->>Att: Create new backup attempt
    Orch->>Card: Attempt backup card
    Card->>PSP: Capture
    PSP-->>WH: Success
    WH-->>Orch: Verified success
    Orch->>Att: Mark backup attempt CAPTURED
    Orch->>PSM: Workflow → COLLECTED
    Orch->>OB: Outbox collection posting trigger
```

## Important invariants

- Retries and fallbacks create new attempt rows.
- Terminal attempts (DECLINED, ERROR, CAPTURED, CANCELLED) are immutable success/failure history.
- Only CAPTURED attempt supports workflow COLLECTED.
- Soft RETRYABLE does **not** retry the same method immediately when a backup is eligible (ADR-024 OPTION B).

## Failure notes

- No eligible backup after RETRYABLE + retry budget remains → SEQ-PAY-005 (`RETRY_PENDING`).
- No eligible backup after NON_RETRYABLE, or retry budget exhausted → `ACTION_REQUIRED` (ADR-024), not automatic FAILED.
- Recovery window closed → SEQ-PAY-006 (`FAILED`).

## Related

LikeC4: `backupRecovery`. ADR-003 workflow vs attempt. ADR-024 recovery ordering.
