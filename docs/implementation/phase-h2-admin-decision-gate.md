# Phase H2 — Durable DLQ & operator replay decision gate (architecture)

**Status:** PASS — binding policy in [ADR-034](../decisions/ADR-034-durable-dead-letter-and-operator-replay-policy.md)

**Scope chosen:** Option A — Durable DLQ + merchant webhook replay only.

H0 (read-only) and H1 (grant dual-control) are PASS. H2 was blocked because durable DLQ ownership, closed replay catalogue, webhook/notification/financial replay semantics, MFA/dual-control for replay, and concurrency/audit were unbound.

This gate **PASSes** for Option A only. Canonical **Phase H** is **not** complete. Platform H2 is **not** implemented by this gate.

## Hard gate result

| # | Gate area | Result |
| --- | --- | --- |
| 1 | H2 scope | **Resolved** — Option A ([ADR-034](../decisions/ADR-034-durable-dead-letter-and-operator-replay-policy.md)) |
| 2 | DLQ ownership | **Resolved** — operations owns `DeadLetterItem`; admin reads/requests only |
| 3 | DLQ purpose | **Resolved** — operational evidence, not business event / correction / guard bypass |
| 4 | Public identity | **Resolved** — `dlq_…` / `rpl_…` |
| 5 | Payload/reference | **Resolved** — typed pointer only; no secrets/PII dumps |
| 6 | Status model | **Resolved** — OPEN / REPLAY_REQUESTED / REPLAYING / RESOLVED / REPLAY_FAILED; no dismiss MVP |
| 7 | DLQ idempotency | **Resolved** — unique `(work_type, source_identity)` |
| 8 | Replay catalogue | **Resolved** — `admin.webhook.replay` only |
| 9 | Financial replay | **Resolved** — PROHIBITED |
| 10 | Financial DLQ visibility | **Resolved** — inspect-only + prohibited messaging |
| 11 | Webhook delivery identity | **Resolved** — reuse `WebhookDelivery`; append attempt |
| 12 | Attempt numbering | **Resolved** — manual = attempt 6+; no history reset |
| 13 | Endpoint / subscription / URL / signature | **Resolved** — ACTIVE required; no subscription recheck; current URL; same `evt_`/body + fresh HMAC |
| 14 | Auto retry after manual | **Resolved** — no automatic 5-retry restart |
| 15 | Notification replay | **Deferred** — preserves ADR-031 |
| 16 | SKIPPED notifications | **Resolved** — never replay to circumvent ADR-031 |
| 17 | Capabilities / MFA / dual control / reason | **Resolved** — `admin.dlq.view` + `admin.webhook.replay`; MFA ≤15m; no dual control for webhook; reason 16–500 |
| 18 | Request model / concurrency / idempotency | **Resolved** — `OperatorReplayRequest`; one active per DLQ; execute-once per `rpl_` |
| 19 | Worker / outbox | **Resolved** — notification-worker executes `ReplayWebhookDelivery` via outbox |
| 20 | Privacy / retention / financial non-mutation | **Resolved** — minimisation; operational retention class (no invented days); no financial mutation |
| 21 | Break-glass / impersonation / corrections / lifecycle | **Deferred / NOT SUPPORTED** — unchanged |

## Scope options evaluated

| Option | Verdict |
| --- | --- |
| **A — Durable DLQ + webhook replay** | **Selected for H2** |
| B — + notification replay | Rejected for H2 — ADR-031 conflict surface |
| C — Generic DLQ replay | Rejected — financial bypass |
| D — Full operator recovery | Rejected — unbound |

## H2 Option A principle

> H2 Option A proves durable dead-letter evidence and **controlled merchant webhook HTTP replay** under MFA + reason, without generic financial or notification replay.

## Platform H2 may implement (after this gate)

See [phase-h2-platform-checklist](./phase-h2-platform-checklist.md).

## Must not invent (H2 Option A)

- notification replay / SKIPPED retroactive send
- financial command / ledger / settlement / payment replay
- generic queue-message replay / force-success
- financial corrections
- merchant/user lifecycle mutations
- impersonation / break-glass
- dismiss-without-replay mutation
- admin direct provider/merchant HTTP calls
- expanding grant catalogue beyond ADR-033

## Engineering decomposition

| Slice | Scope |
| --- | --- |
| **H0** | Read-only admin (PASS — ADR-032) |
| **H1** | Grant dual-control (PASS — ADR-033) |
| **H2 Option A** | Durable DLQ + webhook replay (this gate — architecture PASS; platform not started) |
| **H3+** | Notification replay (if gated), lifecycle mutations, corrections, production MFA provider, SIEM, roles — separately gated |

Canonical **Phase H** is **not** complete after H2 Option A alone.

## Exit

**H2 REPLAY DECISION GATE: PASS**
