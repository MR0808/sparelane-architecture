# Deployable Mapping

Maps modules to initial deployables ([ADR-018](../decisions/ADR-018-logical-vs-physical-services.md)).

| Deployable | Modules / concerns hosted | Independently deployable? | Why |
| --- | --- | --- | --- |
| **web** | Consumer UI, Merchant Portal, Admin Portal, Hosted Flow | Yes | Stateless UI; release cadence differs from workers |
| **api** | Consumer/Merchant/Admin BFF, Merchant API, Provider Webhook Ingress, Identity edge, Bills commands | Yes | Sync HTTP path; scale on request load |
| **payment-worker** | Payment Workflows, Attempts, Reliability, Risk checks, PSP adapter, payment retries | Yes | Tier-1 financial async; isolate from notifications |
| **settlement-worker** | Settlement, Reconciliation, Settlement adapter | Yes | Tier-1; isolate from analytics/notifications ([ADR-019](../decisions/ADR-019-financial-workload-isolation.md)) |
| **notification-worker** | Webhooks delivery, Notifications, email/SMS adapters | Yes | Failures must not stop payments |
| **scheduler** | Platform scheduler / bill due sweeps | Initially co-located or infra cron | Creates work items only; not a permanent hard requirement as separate app |
| **outbox-publisher** | Outbox / Events publish loop | Dedicated process **or** shared background in worker/api | Tier-1 for ledger path; may start co-located then split |

Shared packages (`domain`, `db`, `ledger`, `contracts`, `security`, `integrations`) are imported by apps — not separate runtime microservices.
