# ADR-003 — Separate Payment Workflow from Payment Attempt

## Status

Accepted

## Context

A single bill collection journey may require:

- pre-authorisation
- primary method attempt
- one or more backup fallbacks
- scheduled retries
- consumer-initiated retries

If these are modelled as one mutable payment record, Sparelane loses auditability, provider reference history and reliable analytics for recovery performance.

## Decision

Model the overall bill collection journey as a **Payment Workflow**, separate from individual **Payment Attempts**.

```text
Bill 1 → 1 Payment Workflow   (MVP)
Payment Workflow 1 → 1..N Payment Attempts
```

- One bill represents one collection obligation.
- Fallback and retries belong inside **one** workflow; attempts provide the 1..N execution history.
- This avoids duplicate collection workflows for the same bill.
- Payment Workflow owns collection progress states such as `SCHEDULED`, `PAYMENT_PENDING`, `RETRY_PENDING`, `COLLECTED`, `FAILED`.
- Payment Attempt owns one concrete execution against one method/rail and remains immutable history once completed.

Retries and fallbacks create new attempts; they do not rewrite a failed attempt into success.

A later product capability could require multiple workflows against a bill; that requires an **explicit future architecture decision** and must not be introduced in MVP for hypothetical flexibility.

## Consequences

### Positive

- supports fallback and retry without losing history
- preserves provider references per attempt
- enables reconciliation and recovery analytics
- clarifies that `COLLECTED` is a workflow outcome supported by a successful attempt

### Negative / tradeoffs

- more entities to reason about than a single payment status field
- requires careful idempotency so duplicate commands do not create uncontrolled extra attempts
- UI and APIs must expose workflow vs attempt clearly

## Alternatives Considered

1. **Single payment status record updated in place** — rejected; insufficient for fallback/retry audit trails.
2. **Event-sourced attempts only with no workflow aggregate** — deferred; operational current-state queries still need a workflow projection for MVP.
3. **One attempt per bill hard-stop** — rejected; eliminates Sparelane’s reliability differentiator.
