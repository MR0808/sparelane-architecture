# Runbook — Payment Provider Outage

## Symptom

Elevated PSP timeouts/errors; payment attempt failures; provider latency alerts.

## Impact

New collections may pause or fail temporarily. Existing `COLLECTED` funds unchanged. Settlements independent unless also impacted.

## Checks

- provider status / our outbound error rates
- queue depth for payment workers
- unknown-outcome attempts awaiting reconcile
- DLQ related to payment processing

## Safe actions

- enable backpressure / reduce concurrency
- pause non-critical workloads if needed
- reconcile unknown outcomes via provider query/webhooks before new attempts
- communicate degraded payment initiation if product requires

## Unsafe actions

- blind replay of payment attempts that may have succeeded
- forcing workflow to COLLECTED without provider evidence
- disabling idempotency checks

## Escalation

Tier-1 on-call → payments lead → provider support channel.

## Recovery validation

- provider success rates recover
- unknown outcomes cleared or safely classified
- no duplicate collections detected in reconciliation
