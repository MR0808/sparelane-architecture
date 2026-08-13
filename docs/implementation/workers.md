# Worker Design

## Contract

Each worker:

1. Receives one logical work item
2. Loads **current authoritative state** from Operational/Ledger DB
3. Validates state still permits the action
4. Executes side effect (provider call, ledger post, delivery)
5. Records durable result
6. Emits next event / outbox as designed
7. Acknowledges the message **only after** durable completion

## Rules

- Financial workers must **not** trust stale event payloads as the sole state source
- Unknown external outcomes → reconcile, do not blind retry side effects
- Idempotent handling of redelivery
- Concurrency limits per worker pool; Tier-1 isolated from notifications ([ADR-019](../decisions/ADR-019-financial-workload-isolation.md))
- Failures after bounds → DLQ with safe replay rules
