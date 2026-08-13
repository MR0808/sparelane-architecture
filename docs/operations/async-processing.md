# Async Processing

Internal asynchronous work assumes **at-least-once** delivery and **idempotent consumers** ([ADR-017](../decisions/ADR-017-at-least-once-async-processing.md)).

## Principles

- durable messages
- at-least-once processing
- idempotent consumers
- bounded retries
- dead-letter handling
- visibility into failed messages
- replay tooling for authorised operators
- correlation IDs on all messages
- **no assumption of global ordering**

## Where ordering / serialization matters

| Scope | Why |
| --- | --- |
| Same Payment Workflow | Prevent concurrent duplicate collection attempts |
| Same Settlement | Prevent duplicate instruction submission |
| Same Webhook Event | Stable delivery state across attempts |

Partition keys / per-aggregate serialization are conceptual options. Broker technology TBD.

## Typical async workloads

- payment retries and provider-result continuation
- ledger posting after collection (outbox)
- settlement processing
- webhook delivery
- notifications
- analytics ingestion
- reconciliation
- scheduled bill actions
