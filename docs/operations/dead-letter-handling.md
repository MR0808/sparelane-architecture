# Dead-Letter Handling

A unit of asynchronous work may enter durable dead-letter state after bounded processing failure.

Binding policy: [ADR-034](../decisions/ADR-034-durable-dead-letter-and-operator-replay-policy.md).

## Distinctions (binding)

| Concept | Meaning |
| --- | --- |
| **Automatic retries** | Bounded domain/transport retries (e.g. webhook max 5) before exhaustion |
| **Durable DLQ** | Operations-owned `DeadLetterItem` (`dlq_…`) — operational evidence |
| **Manual operator replay** | Closed catalogue only (`admin.webhook.replay` in H2) |
| **Domain recovery / reconciliation** | Payment/settlement UNKNOWN and financial corrections — **not** generic DLQ replay |

## H0 / H1

- H0: no DLQ admin UI ([ADR-032](../decisions/ADR-032-platform-admin-authority-read-only-control-plane.md))
- H1: no DLQ / replay ([ADR-033](../decisions/ADR-033-privileged-admin-grant-management-and-approval.md))
- Platform in-memory DLQ alone is **not** production operator tooling

## H2 — durable DLQ (Accepted)

- **Owner:** operations / queue infrastructure — not an admin-owned copy of domain entities
- **Purpose:** durable evidence of exhaustion / manual-intervention state — not a business event, outbox replacement, or correction mechanism
- **Identity:** `dlq_…`; unique `(work_type, source_identity)`
- **Payload:** typed pointer / replay reference only — no secrets, contact email, provider tokens, bank details, raw PSP payloads
- **Statuses:** `OPEN` → `REPLAY_REQUESTED` → `REPLAYING` → `RESOLVED` | `REPLAY_FAILED` (then available as `OPEN`). No dismiss MVP
- **Persistence vs replay:** notification and financial work may persist inspect-only rows; only `merchant.webhook.delivery` is manually replayable in H2

## H2 — closed operator replay

| Action | Allowed |
| --- | --- |
| `admin.webhook.replay` | Yes — see ADR-034 / ADR-030 |
| `admin.notification.replay` | No (deferred; preserve ADR-031) |
| Financial command / ledger / settlement replay | **Prohibited** |
| Arbitrary queue-message replay | **Prohibited** |

Webhook replay: reuse `WebhookDelivery`; append attempt 6+; same `evt_`/body; fresh HMAC; endpoint must be `ACTIVE`; no automatic 5-retry restart after manual failure; at-least-once (merchant dedupe by `evt_`).

Authority: `admin.dlq.view` + `admin.webhook.replay`; recent MFA ≤15m; reason 16–500; **no** dual control for webhook replay ([OD-026](../decisions/open/OD-026-dual-control-break-glass.md) H2 slice). Execution via `OperatorReplayRequest` (`rpl_…`) + notification-worker — admin never calls merchant HTTP directly.

## Critical rule

> Generic DLQ replay must never blindly repeat a financial side effect.

Payment and settlement unknown outcomes use reconciliation — not H2 operator replay.

## Operator visibility

For every DLQ item, operators must determine:

- work type / source kind
- source public IDs (e.g. `evt_…`)
- failure class / attempt count / failedAt / status
- whether replay is eligible
- safe correlation info

Financial items must clearly state: **manual replay not permitted; use domain recovery/reconciliation.**
