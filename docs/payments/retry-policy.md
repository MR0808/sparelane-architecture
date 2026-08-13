# Retry Policy (MVP Principles)

Sparelane distinguishes **method fallback** from **scheduled retry**. They are not the same operation.

Related components:

- Payment Orchestrator — decides workflow action
- Reliability Engine — decides method eligibility/selection
- Decline Classification — classifies whether an outcome is retryable
- Retry Service — schedules timing only; does not orchestrate payment execution

## Method fallback

Trying another eligible method during the same recovery cycle without waiting for a later schedule.

Example:

```text
Primary card fails (eligible for fallback)
→ Backup card 1
→ Backup card 2
→ Wallet if eligible
```

Fallback creates a **new Payment Attempt** for the next method.

## Scheduled retry

Waiting until a later time before attempting payment again for the same workflow.

Example:

```text
Soft/retryable decline
→ no useful immediate fallback
→ Retry Service schedules PaymentRetryDue
→ Orchestrator later creates a new Payment Attempt
```

Scheduled retries also create a **new Payment Attempt**. The original failed attempt remains immutable history.

## Principles

1. **Retry only where the result is retryable** (soft decline, certain technical errors, or explicit product policy).
2. **Respect provider/network rules** for reattempt behaviour once a PSP is selected.
3. **Avoid infinite retries.** Retry count and recovery window must be bounded.
4. **Idempotency must prevent accidental duplicate collection** across queue retries, worker restarts and duplicate webhooks.
5. **Consumer notification may be required** when action is needed or recovery is delayed.
6. **Due date affects the available recovery window.** Exact cutoffs are product configuration / TBD.
7. **Final failure returns control to the merchant collection process.** No settlement eligibility event is emitted.

## Responsibility split

| Concern | Owner |
|---|---|
| Is the outcome retryable? | Decline Classification (+ product policy) |
| Is there another eligible method now? | Reliability Engine |
| Should we fallback now, schedule later, ask consumer, or fail? | Payment Orchestrator |
| When is the next retry due? | Retry Service |
| Execute provider payment | Card / Wallet adapters via Orchestrator |

Retry Service must not become a second orchestrator.

## Timing rules

Exact retry hours/days, maximum attempts, quiet hours and due-date cutoffs are **not fixed in architecture**.

Mark as:

```text
Product configuration / TBD
```

Architecture requires that whatever timings are chosen remain:

- bounded
- auditable
- enforceable by Retry Service + State Machine
- safe under idempotent command processing

## Terminal failure

When no eligible method remains and no permitted retry remains inside the recovery window:

1. workflow → `FAILED`
2. notify consumer as required
3. notify merchant via webhook
4. merchant resumes normal collection
5. do **not** emit settlement eligibility / `PaymentSucceeded`
