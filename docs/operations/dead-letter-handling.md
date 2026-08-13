# Dead-Letter Handling

A message may enter the Dead Letter Queue (DLQ) after bounded processing failure.

## Operator visibility

For every DLQ item, operators must be able to determine:

- source event / message type
- aggregate / business ID (workflow, settlement, webhook event, etc.)
- failure reason
- attempt count
- correlation ID
- whether replay is safe
- current authoritative state (Operational DB / Ledger / provider)

## Critical rule

> DLQ replay must never blindly repeat a financial side effect.

Payment and settlement replay must first check idempotency keys and external/provider state. Prefer reconcile-then-continue over blind resubmit.

## Replay

- authorised operators only
- durable audit of replay actions
- idempotent consumers absorb duplicates
- unsafe to replay if authoritative state already reflects success and side effect would duplicate

See runbook: [`runbooks/dlq-replay.md`](./runbooks/dlq-replay.md).
