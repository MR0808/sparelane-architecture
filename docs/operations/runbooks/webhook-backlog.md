# Runbook — Webhook Backlog

## Symptom

Merchant webhook delivery failures/latency; delivery queue depth; Retry-After / 5xx from merchants.

## Impact

Merchants lag on status updates. Payment and settlement correctness must continue.

## Checks

- delivery failure rate by merchant
- queue depth / oldest pending event
- signing/config errors vs transient merchant outages
- DLQ for webhook worker

## Safe actions

- bounded delivery retries
- isolate abusive/broken endpoints
- shed non-critical notifications first if shared capacity
- notify affected merchants to fix endpoints

## Unsafe actions

- generating new event IDs for retries
- disabling signature verification
- blocking payment workers to “catch up” webhooks on shared capacity without isolation

## Escalation

Tier-2 on-call → merchant success / integration support.

## Recovery validation

- backlog draining
- successful 2xx acknowledgements
- no duplicate business actions on merchant side (their idempotency)
