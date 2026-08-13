# Runbook — Settlement Provider Outage

## Symptom

Settlement instruction failures/timeouts; settlements stuck PENDING/PROCESSING; partner unavailable.

## Impact

Settlements delayed. **Consumer collections remain COLLECTED.** Do not reverse payments.

## Checks

- settlement pending age metrics
- unknown settlement outcomes
- ledger payable vs settlement state
- partner status

## Safe actions

- backoff / retry with provider idempotency references
- hold new settlement submissions if partner unhealthy
- alert finance/ops; notify merchants of payout delay if required

## Unsafe actions

- reversing COLLECTED payments because settlement is down
- blind duplicate settlement instructions without outcome checks
- marking SETTLED without provider confirmation

## Escalation

Tier-1 on-call → settlement/finance lead → banking partner support.

## Recovery validation

- settlements resume and complete
- no duplicate payouts
- reconciliation matches
