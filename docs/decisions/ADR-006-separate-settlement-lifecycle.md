# ADR-006 — Separate Settlement Lifecycle

## Status

Accepted

## Context

After consumer funds are collected, merchant payout is asynchronous, partner-mediated and subject to failure, retry, unknown outcomes and reconciliation. Collapsing this into Payment Workflow state hides important financial and operational distinctions.

## Decision

Payment Workflow state and Settlement state are modelled separately.

```text
Payment Workflow = COLLECTED
```

does not imply:

```text
Settlement = SETTLED
```

Settlement has its own lifecycle (`PENDING` / `ELIGIBLE` / `BATCHED` / `SUBMITTED` / `PROCESSING` / `SETTLED` / `FAILED` / `RETRY_PENDING` / `CANCELLED`).

MVP obligation cardinality, amount source, and eligibility gates: [ADR-027](./ADR-027-settlement-obligation-eligibility-cardinality.md).

## Consequences

### Positive

- supports asynchronous settlement processing
- isolates settlement failures from successful consumer collection
- enables bounded settlement retries and unknown-outcome handling
- improves reconciliation, reporting and auditability
- prevents treating provider acknowledgement as final settlement

### Negative / tradeoffs

- more states for product/engineering to reason about
- requires explicit handoff events from payment to settlement
- APIs and merchant reports must present both collection and settlement clearly

## Alternatives Considered

1. **Extend Payment Workflow with SETTLED status** — rejected; conflates collection and payout.
2. **Mark SETTLED on instruction acknowledgement** — rejected; acknowledgement is not confirmation.
3. **No internal settlement state; rely only on bank statements** — rejected; Sparelane needs controlled eligibility, idempotency and merchant-facing status.
