# Deployment Units

Logical services express responsibility boundaries. They **do not** imply one container/process per service ([ADR-018](../decisions/ADR-018-logical-vs-physical-services.md)).

Conceptual deployable units:

## Web / Experience Application

Hosts interactive experiences. May be one or multiple deployables:

- Consumer Web
- Merchant Portal
- Admin Portal
- Hosted Flow / Widget assets

Exact split TBD (e.g. shared Next.js app vs separate frontends).

## API Application

HTTP request handling for:

- Consumer backend
- Merchant backend
- Admin backend
- Merchant API
- Provider Webhook Ingress

Stateless where practical. Does not run long-running settlement batches or heavy analytics.

## Payment Worker

Asynchronous payment workflow work:

- payment execution
- provider result handling
- retry execution
- collection → outbox publication coordination (with Operational DB)

## Settlement Worker

- settlement lifecycle
- batching
- settlement instruction submission
- settlement reconciliation

Isolated from non-critical workloads ([ADR-019](../decisions/ADR-019-financial-workload-isolation.md)).

## Notification / Webhook Worker

- email / SMS notifications
- merchant webhook delivery

Failures must not stop payment correctness.

## Scheduler

Triggers time-based work (bills due, retries due, settlement/reconciliation sweeps, maintenance).

Creates commands/work items; **does not** own workflow state or execute complex financial logic itself.

Platform: cron / queue timers / managed scheduler — **vendor TBD**.

## Outbox Processor

Publishes transactional outbox records to the event bus. May share a worker deployable or run as a dedicated process. Implementation TBD.
