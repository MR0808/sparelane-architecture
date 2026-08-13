# Retry Strategy Taxonomy

Do **not** use one generic retry policy for all failure types.

## Business retry

Example: retrying a soft-declined payment later within product windows.

Owned by Payment Reliability Engine / Retry Service. Creates a **new** Payment Attempt when due.

## Technical retry

Example: timeout calling PSP with unknown outcome.

Must not blindly duplicate collection. Prefer query/reconcile provider or await verified webhook before continuing.

## Delivery retry

Example: merchant webhook 5xx / timeout.

Same event ID, bounded backoff, at-least-once. Not a new domain event.

## Processing retry

Example: transient DB error or queue consumer crash mid-handler.

Bounded consumer retries; then DLQ. Consumers must be idempotent.

## Settlement retry

Financially sensitive. Subject to settlement state machine, provider idempotency references, and unknown-outcome handling before resubmit.

## Separation

| Type | Risk if conflated |
| --- | --- |
| Business vs technical | Duplicate collections or missed recovery |
| Delivery vs domain | Spurious merchant events |
| Settlement vs payment | Settlement retries that ignore provider state |
