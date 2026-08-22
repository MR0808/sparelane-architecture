# Observability

Three pillars. Vendor TBD.

## Logs

- structured
- correlated (correlation ID, workflow ID, settlement ID, merchant ID where safe)
- redacted: no secrets, CHD, API keys, tokens, CVV, PAN

## Metrics (conceptual)

- payment success / failure rates
- retry counts
- queue depth
- webhook delivery failures (`type`, `outcome` only — no merchant/endpoint/event ids)
- webhook SSRF blocks (`error_class` bounded)
- settlement pending age
- reconciliation mismatches
- DLQ size
- provider latency
- ledger posting lag / failure
- outbox backlog

## Traces

Cross-service correlation using:

- correlation ID
- payment workflow ID
- settlement ID
- merchant ID where safe

Do not put secrets or CHD in trace attributes.
