# Retry Policy (MVP Principles)

Sparelane distinguishes **method fallback** from **scheduled retry**. They are not the same operation.

Binding recovery ordering and exhaustion: [ADR-024](../decisions/ADR-024-payment-recovery-ordering-and-exhaustion.md).

Binding numeric timings, budget, cutoff, due clock, Retry Now, timezone: [ADR-025](../decisions/ADR-025-payment-retry-timing-budget-and-recovery-window.md).

Related components:

- Payment Orchestrator — decides **whether** backup, retry-later, action-required, fail, or reconcile
- Reliability Engine — decides method eligibility/selection
- Decline Classification — classifies whether an outcome is retryable / hard / technical / unknown
- Retry Service — schedules **when** a retry fires; does not orchestrate payment execution

## Method fallback

Trying another eligible method during the same recovery cycle without waiting for a later schedule.

MVP default ([ADR-024](../decisions/ADR-024-payment-recovery-ordering-and-exhaustion.md)):

```text
Primary (or current) method declines RETRYABLE or NON_RETRYABLE
→ exclude current from immediate selection (soft: immediate walk only; hard: workflow-scoped)
→ Reliability Engine returns next eligible backup
→ Orchestrator creates a new Payment Attempt
```

Fallback creates a **new Payment Attempt** for the next method.

## Scheduled retry

Waiting until a later time before attempting payment again for the same workflow.

MVP default:

```text
RETRYABLE decline (or TECHNICAL_ERROR with known no-charge)
→ Reliability Engine confirms no useful immediate fallback (for RETRYABLE)
  OR policy forbids backup-for-technical (for TECHNICAL_ERROR)
→ if same-method retry budget remains → workflow RETRY_PENDING
→ Retry Service (D5) schedules PaymentRetryDue
→ Orchestrator later creates a new Payment Attempt
```

Scheduled retries also create a **new Payment Attempt**. The original failed attempt remains immutable history.

## D4 vs D5

| Phase | Owns |
| --- | --- |
| **D4** | Whether recovery needs retry-later, backup, action, collect, fail, or reconcile; may set `RETRY_PENDING` |
| **D5** | Retry count/timings (ADR-025), `scheduledFor`, ScheduledJob, firing `PaymentRetryDue`, cutoff → `FAILED`, Retry Now |

## MVP numeric defaults (ADR-025)

| Parameter | Default |
| --- | --- |
| Max same-method scheduled retries | **3** |
| Ordinal delays | **+6h / +24h / +48h** (elapsed from prior qualifying `completedAt`) |
| Quiet hours | **None** |
| Due execution clock | **09:00** frozen merchant IANA TZ on `dueDate` |
| Recovery cutoff | **dueDate + 7 calendar days @ 09:00** same TZ |
| Budget scope | **Per PaymentMethod per PaymentWorkflow** |
| RETRYABLE vs TECHNICAL_ERROR | **Shared** business budget; D3 worker retries do not count |
| Retry Now | Accelerates next permitted ordinal; **consumes** it; cancels ScheduledJob |

Architecture default is binding for MVP. Future merchant overrides must stay within ADR-025 bounds.

## Same-method retry eligibility

Same-method scheduled retry is permitted when:

- classification is `RETRYABLE` and no immediate eligible backup remains, and retry budget remains; or
- classification is `TECHNICAL_ERROR` with known no-charge, and retry budget remains

Same-method scheduled retry is **not** used to bypass UNKNOWN reconciliation.

## Principles

1. **Retry only where the result is retryable** (soft decline, certain technical errors with known no-charge, or explicit product policy).
2. **Respect provider/network rules** for reattempt behaviour once a PSP is selected.
3. **Avoid infinite retries.** Retry count and recovery window are bounded (ADR-025).
4. **Idempotency must prevent accidental duplicate collection** across queue retries, worker restarts and duplicate webhooks.
5. **Consumer notification may be required** when action is needed or recovery is delayed.
6. **Due date defines due execution and cutoff** (ADR-025); do not conflate the two instants.
7. **Automatic method/budget exhaustion → ACTION_REQUIRED** (ADR-024). **FAILED** when the recovery window is closed or another terminal trigger applies (with UNKNOWN/in-flight guards).
8. **Final failure returns control to the merchant collection process.** No settlement eligibility event is emitted.

## Responsibility split

| Concern | Owner |
|---|---|
| Is the outcome retryable? | Decline Classification (+ product policy) |
| Is there another eligible method now? | Reliability Engine |
| Should we fallback now, schedule later, ask consumer, or fail? | Payment Orchestrator ([ADR-024](../decisions/ADR-024-payment-recovery-ordering-and-exhaustion.md)) |
| When is the next retry due? | Retry Service ([ADR-025](../decisions/ADR-025-payment-retry-timing-budget-and-recovery-window.md)) |
| Execute provider payment | Card / Wallet adapters via Orchestrator |

Retry Service must not become a second orchestrator. Decline Classification must not call Retry Service. Platform Scheduler creates work items; it does not decide `FAILED`.

## Terminal failure

When **no eligible method remains** and **no permitted retry remains inside the recovery window** (cutoff / window closed), subject to ADR-025 UNKNOWN/in-flight guards:

1. workflow → `FAILED`
2. notify consumer as required
3. notify merchant via webhook
4. merchant resumes normal collection
5. do **not** emit settlement eligibility / `PaymentSucceeded`

When automatic methods and same-method retry budget are exhausted **but the recovery window is still open**, Orchestrator moves to **`ACTION_REQUIRED`** first so the consumer can remediate ([ADR-024](../decisions/ADR-024-payment-recovery-ordering-and-exhaustion.md)).
