# Runbook — DLQ Replay

## Symptom

DLQ depth growing; specific message types repeatedly failing.

## Impact

Async work stalled (payments continuation, ledger posting, settlement, webhooks, notifications). Risk of unsafe replay if financial side effects already applied.

## Checks

For each message:

- source event type
- aggregate/business ID
- failure reason / attempt count
- correlation ID
- authoritative Operational DB / Ledger / provider state
- whether replay is safe

## Safe actions

- fix underlying fault (poison payload, dependency, bug)
- replay only when idempotent and side effect not already committed
- audit operator replay action

## Unsafe actions

- bulk blind replay of payment/settlement messages
- replay without checking provider/ledger state
- deleting DLQ items without disposition record

## Escalation

On-call → owning domain engineer → security if privilege misuse suspected.

## Recovery validation

- message processed successfully
- no duplicate financial effects
- DLQ depth declining for that class
