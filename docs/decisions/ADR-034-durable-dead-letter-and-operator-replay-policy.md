---
id: ADR-034
title: Durable Dead-Letter and Operator Replay Policy
status: Accepted
date: 2026-08-23
deciders: Architecture
consulted: Product / Security / Privacy / Operations
informed: Platform engineering
supersedes: []
related:
  - ADR-012
  - ADR-016
  - ADR-017
  - ADR-019
  - ADR-030
  - ADR-031
  - ADR-032
  - ADR-033
  - OD-024
  - OD-026
---

# ADR-034 — Durable Dead-Letter and Operator Replay Policy

## Status

**Accepted**

Unblocks platform **H2 Option A** — durable dead-letter persistence, admin inspection, and **closed merchant webhook replay only** — without inventing generic queue replay, financial command replay, notification replay, financial corrections, lifecycle mutations, break-glass, or impersonation.

Canonical **Phase H** remains **incomplete** after this slice: production IdP MFA (OD-024 provider), merchant/user lifecycle mutations, notification replay, corrections, support PII tooling, audit export/SIEM, and break-glass remain separately gated.

See [phase-h2-admin-decision-gate](../implementation/phase-h2-admin-decision-gate.md).

## Context

[ADR-032](./ADR-032-platform-admin-authority-read-only-control-plane.md) bound H0 read-only admin. [ADR-033](./ADR-033-privileged-admin-grant-management-and-approval.md) bound H1 grant dual-control. Both explicitly deferred durable DLQ and operator replay.

[ADR-030](./ADR-030-merchant-webhook-contract-signing-and-delivery.md) reserved operator webhook HTTP replay to Phase H and cited missing replay semantics. Platform DLQ today is in-memory only ([dead-letter-handling](../operations/dead-letter-handling.md)).

[ADR-031](./ADR-031-consumer-notification-contact-channel-and-delivery-policy.md) binds `NO_ACTIVE_CONTACT` → `SKIPPED` with **no retroactive send** when contact later appears. Generic notification replay would invent a conflict with that policy.

Blind financial replay conflicts with [financial-integrity](../security/financial-integrity.md), payment/settlement unknown-outcome reconciliation, and append-only ledger policy.

## Scope options

| Option | Scope | Verdict |
| --- | --- | --- |
| **A — Durable DLQ + webhook replay** | Durable DLQ; admin inspect; closed `admin.webhook.replay`; no notification replay; no financial replay | **Selected for H2** |
| **B — DLQ + webhook + notification replay** | Option A + safe technical notification replay | Rejected for H2 — ADR-031 SKIPPED / no-retroactive-send and contact recheck policy not fully gated for operator send |
| **C — Generic durable DLQ replay** | Any failed work replayable | **Rejected** — invents financial bypass |
| **D — Full operator recovery** | Replay + corrections + lifecycle mutations | **Rejected** — unbound; not H2 |

## Decision summary (binding for H2 Option A)

| # | Decision |
| --- | --- |
| 1 | **H2 scope:** Option A only |
| 2 | **DLQ ownership:** operations / queue infrastructure owns `DeadLetterItem`; admin reads and requests replay; admin does **not** own queue persistence |
| 3 | **DLQ purpose:** durable operational evidence of exhausted / manual-intervention async work — **not** a business event, outbox replacement, correction mechanism, or authority to ignore domain guards |
| 4 | **Public ID:** `dlq_…` (stable); internal UUID not exposed |
| 5 | **Payload policy:** typed **pointer / replay reference** to authoritative source only (prefer C/D) — no raw secrets, PAN, bank details, webhook signing secret, contact email, provider tokens, auth subjects, API credentials, or raw PSP payloads |
| 6 | **Statuses:** `OPEN` → `REPLAY_REQUESTED` → `REPLAYING` → `RESOLVED` \| `REPLAY_FAILED` (return to `OPEN` after failed replay). **No** `DISMISSED` mutation in H2 MVP |
| 7 | **Idempotency:** unique `(work_type, source_identity)` — one durable item per logical work; subsequent failures update the same row |
| 8 | **Closed replay catalogue:** `admin.webhook.replay` **only**. No `admin.dlq.replay_anything`. No `admin.notification.replay` in H2 |
| 9 | **Financial replay:** **PROHIBITED** via generic operator replay |
| 10 | **Financial DLQ visibility:** safe read-only metadata permitted; UI states manual replay prohibited — use domain recovery/reconciliation |
| 11 | **Webhook delivery identity:** reuse existing `WebhookDelivery` (event×endpoint); append new attempt |
| 12 | **Webhook attempt numbering:** manual replay creates attempt **6+** (does not reset automatic history) |
| 13 | **Endpoint:** must be `ACTIVE` immediately before replay; DISABLED/REVOKED blocks; do **not** reactivate |
| 14 | **Subscription:** do **not** recheck current subscription — historical delivery may replay while endpoint ACTIVE |
| 15 | **URL:** current endpoint URL (G1 URL mutation unsupported ⇒ current == original); future URL change needs later policy |
| 16 | **Signature:** same `evt_`, same immutable body, fresh timestamp, fresh HMAC with current valid signing secret |
| 17 | **Auto retry after manual:** **NO** — one operator-requested attempt; failure leaves DLQ open / `REPLAY_FAILED`; operator must decide again |
| 18 | **Webhook success:** logical delivery may transition `FAILED` → `SUCCEEDED`; attempt history retained; DLQ → `RESOLVED` |
| 19 | **Notification replay:** **deferred** — not in H2 catalogue |
| 20 | **SKIPPED notifications:** never manually replayed to circumvent ADR-031 (including `NO_ACTIVE_CONTACT`) |
| 21 | **Capabilities:** `admin.dlq.view`, `admin.webhook.replay` (deny-by-default; no wildcard) |
| 22 | **Risk class:** webhook replay = **MEDIUM**; financial = **PROHIBITED**; notification replay = deferred |
| 23 | **MFA:** fresh privileged MFA via `PrivilegedAuthenticationContext`; max age **≤15 minutes** (reuse ADR-033; do not invent a second freshness window) |
| 24 | **Dual control:** **not required** for webhook replay (single admin + MFA + reason). OD-026 H2 replay slice resolved for webhook only; break-glass / broader mutations remain open |
| 25 | **Reason:** mandatory 16–500 chars; no secrets/PII dumps (reuse ADR-033) |
| 26 | **Request model:** `OperatorReplayRequest` (`rpl_…`) — **not** `PrivilegedActionRequest` (no approval workflow) |
| 27 | **Replay idempotency:** one `rpl_` executes at most one logical transport attempt; intentional later retry ⇒ new `rpl_` + new reason |
| 28 | **Concurrency:** at most one active (`requested`/`executing`) replay request per `DeadLetterItem` |
| 29 | **Execution:** Admin BFF creates durable request + transactional outbox; **notification-worker** executes `ReplayWebhookDelivery`; admin never calls merchant HTTP directly |
| 30 | **Financial non-mutation:** webhook replay must not mutate Bill / PaymentWorkflow / PaymentAttempt / Journal / Settlement / SettlementInstruction |
| 31 | **Transport semantics:** at-least-once; merchant must dedupe by `evt_`; do **not** claim exactly-once |
| 32 | **Dismiss:** **out of H2 MVP** |

## 1. DeadLetterItem ownership and purpose

**Owner:** operations / queue infrastructure (Operational DB).

**Admin module:** authorises `admin.dlq.view` / `admin.webhook.replay`, lists/details safe metadata, creates `OperatorReplayRequest`.

Do **not** copy domain entities into an admin-owned table.

A dead-letter item is durable operational evidence that a unit of asynchronous work exhausted automatic handling or entered manual-intervention state. It is **not** a new business event, a replacement outbox, a financial correction mechanism, or authority to ignore domain guards.

## 2. Identity

| Field | Rule |
| --- | --- |
| Internal `id` | UUID (UUIDv7 preferred); never exposed on admin UI as primary handle |
| `public_id` | `dlq_…` opaque stable public ID for inspection/audit |
| Replay request | `rpl_…` |

## 3. Minimal model — DeadLetterItem

| Field | Notes |
| --- | --- |
| `id` | Internal PK |
| `public_id` | `dlq_…` UNIQUE |
| `work_type` | Closed enum — see §5 |
| `source_kind` | e.g. `webhook_delivery`, `consumer_notification`, `financial_work` |
| `source_identity` | Stable logical key (e.g. webhook delivery internal id string, or typed composite) |
| `replay_reference` | Typed JSON pointer to authoritative rows (delivery id, `evt_…`, endpoint `wh_…`) — **no** raw payload dump |
| `status` | DeadLetterStatus |
| `failed_at` | Last failure time |
| `failure_code` | Safe class/code |
| `attempt_count` | Automatic transport attempts exhausted (informational) |
| `correlation_id` / `causation_id` | Original chain |
| `replay_count` | Count of completed operator replay executions |
| `created_at` / `updated_at` | |

**Unique:** `(work_type, source_identity)`.

## 4. Payload / reference policy

**Chosen:** store **typed replay reference / pointer** to authoritative source records (options C/D). Do **not** store full redacted payload or encrypted arbitrary payload in H2 unless a future OD requires it.

Webhook example reference:

```text
{ "kind": "webhook_delivery", "deliveryId": "<uuid>", "eventPublicId": "evt_…", "endpointPublicId": "wh_…" }
```

Authoritative event body remains on `WebhookEvent`.

**Forbidden in DLQ/admin views:** webhook signing secret, contact email, provider token, bank details, PAN/CVV, auth subject, API credential, raw PSP payload.

## 5. Work types and replay eligibility

| `work_type` | Persist DLQ? | Manual replay H2? |
| --- | --- | --- |
| `merchant.webhook.delivery` | Yes (on automatic exhaustion → delivery `FAILED`) | **Yes** via `admin.webhook.replay` |
| `consumer.notification.delivery` | Yes (on automatic exhaustion → notification `FAILED`) | **No** — inspect only; replay deferred |
| `financial.work` | Yes when financial poison/exhaustion already routes to DLQ | **No** — inspect only; domain recovery/reconcile only |

Persistence eligibility ≠ replay eligibility.

Payment/settlement **UNKNOWN** outcomes must **not** become generic replayable DLQ work; they remain under reconciliation policy ([NFR-REL-005](../../requirements/non-functional/NFR-REL-005.md), ADR-024/025/028/029).

## 6. Status model

```text
OPEN
REPLAY_REQUESTED
REPLAYING
RESOLVED
REPLAY_FAILED
```

| From | To | When |
| --- | --- | --- |
| — | OPEN | First durable persist on exhaustion |
| OPEN | REPLAY_REQUESTED | Accepted `OperatorReplayRequest` created |
| REPLAY_REQUESTED | REPLAYING | Worker claims execution |
| REPLAYING | RESOLVED | Webhook 2xx / logical delivery SUCCEEDED |
| REPLAYING | REPLAY_FAILED | Manual attempt failed (non-2xx / network) |
| REPLAY_FAILED | OPEN | Item available for another operator decision |
| REPLAY_FAILED | REPLAY_REQUESTED | New `rpl_` accepted |

No dismiss/close-without-replay mutation in H2.

## 7. Closed replay catalogue

| Action | Capability | Risk | Dual control | MFA | Reason |
| --- | --- | --- | --- | --- | --- |
| `admin.webhook.replay` | `admin.webhook.replay` | MEDIUM | No | ≤15m | 16–500 |

**Prohibited (non-exhaustive):** `admin.notification.replay`, `admin.dlq.replay_anything`, payment/settlement/ledger execute/reconcile/retry-now, force-success, arbitrary queue-message replay.

## 8. Financial replay prohibition

Generic operator replay **must not** execute:

- `payment.ExecutePaymentAttempt` / `HandlePaymentAttemptResult` / `PaymentRetryDue` / retry-now
- PaymentCollected ledger posting paths
- `SettlementEligible` / `ExecuteInstruction` / `ReconcileSettlement`
- ledger append / settlement payout journal commands
- financial outbox commands as “replay”

These require domain-specific recovery/reconciliation and carry duplicate-money risk. Binding also recorded in [financial-integrity](../security/financial-integrity.md).

## 9. Webhook replay semantics (binds ADR-030 §21)

1. Load `DeadLetterItem` + `WebhookDelivery` + `WebhookEvent` + endpoint.
2. Require delivery status `FAILED` (or still recoverable exhausted state); endpoint `ACTIVE`.
3. Preserve same `evt_`, immutable event body, type/version, merchant, delivery identity.
4. Append new `webhook_delivery_attempts` row with `attempt_number = max+1` (typically ≥6).
5. Sign with fresh timestamp + current endpoint signing secret.
6. Perform **one** HTTP attempt; **do not** schedule automatic retry budget of 5.
7. On 2xx: delivery → `SUCCEEDED`; DLQ → `RESOLVED`; audit success.
8. On failure: record attempt; delivery remains `FAILED`; DLQ → `REPLAY_FAILED` then available as `OPEN`; audit failure.
9. Merchant dedupe by `evt_` remains required (at-least-once).

## 10. Notification replay (deferred)

H2 does **not** accept `admin.notification.replay`.

Binding preservations for any future gate:

- Must not replay `SKIPPED` / `NO_ACTIVE_CONTACT` merely because a contact later exists
- Must not create a new logical notification / new `business_reference`
- Must recheck consumer not anonymised + contact ACTIVE/verified/owned if ever allowed

## 11. OperatorReplayRequest

| Field | Rule |
| --- | --- |
| `public_id` | `rpl_…` |
| `dead_letter_id` | FK |
| `action` | `admin.webhook.replay` only in H2 |
| `requester_user_id` | active platform admin |
| `reason` | 16–500 |
| `status` | `requested` → `executing` → `succeeded` \| `failed` \| `denied` |
| `mfa_satisfied_at` | snapshotted from privileged auth context |
| Idempotency | execute-once per `rpl_` |

Not routed through ADR-033 dual-control `PrivilegedActionRequest`.

## 12. Correlation / causation

- Preserve original business/event identity (`evt_`, delivery id)
- Preserve original correlation for historical chain
- Operator replay introduces new request correlation (`rpl_…`)
- Replay attempt / audit must reference both original source public IDs and `rpl_…`

## 13. Audit and security

**Mandatory audit:** replay requested; replay executed; replay succeeded; replay failed; replay denied (authz/MFA/eligibility).

Safe metadata only: `dlq_…`, `rpl_…`, work type, `evt_…` / source public ids, admin `usr_…`, reason, outcome. No raw payload.

**Security signals:** unauthorised replay; attempted financial/prohibited replay; replay against non-ACTIVE endpoint; missing/tampered source identity.

Normal merchant HTTP 5xx after authorised replay = **operational** failure, not a security incident.

## 14. Admin UI / BFF

| Surface | Binding |
| --- | --- |
| UI | `/admin/dlq`, `/admin/dlq/[dlqPublicId]` |
| BFF | `GET /admin/v1/dead-letters`, `GET /admin/v1/dead-letters/:id`, `POST /admin/v1/dead-letters/:id/replay` |
| Namespace | Admin only — not Merchant `/v1` |
| Financial rows | Read-only + “manual replay prohibited” |
| No | Generic “Replay Any” |

## 15. Worker / outbox

| Command | Owner |
| --- | --- |
| `CreateDeadLetter` (internal) | operations when exhaustion occurs |
| `RequestWebhookReplay` | Admin BFF / admin orchestration |
| `ReplayWebhookDelivery` | notification-worker (transport) |

Transactional outbox required where architecture already requires it. No direct publish after DB write that skips outbox. No generic `ReplayAnyWork`.

## 16. Privacy and retention

DLQ/replay records must not introduce new PII exposure beyond existing operational metadata. No consumer email / auth subject / secrets in list/detail.

Retention: classify as **operational evidence** under [data-classification](../security/data-classification.md). Do **not** invent a day count in this ADR; follow existing operational retention OD when bound.

## 17. Module boundaries

| Module | Owns |
| --- | --- |
| operations / queue | `DeadLetterItem` persistence |
| admin | authz, read, request orchestration |
| webhooks | webhook replay application rules |
| notifications | (future) notification replay rules — not H2 |
| notification-worker | HTTP/email transport execution for accepted replay commands |
| payment / settlement / ledger | never invoked by H2 replay |

## 18. Phase H implications

H2 Option A delivers durable DLQ + webhook operator replay policy and unblocks platform implementation of that slice.

It does **not** by itself complete canonical Phase H. Remaining separately gated items include (non-exhaustive): production MFA provider (OD-024), merchant/user lifecycle mutations, notification replay, financial corrections, break-glass, impersonation, support PII search, audit export/SIEM, additional admin roles.

## Consequences

- Platform may implement H2 Option A without guessing replay policy
- ADR-030 operator replay handoff is bound here (§9 / former §21 reservation)
- ADR-031 no-retroactive-send preserved by deferring notification replay
- Financial invariants preserved by closed catalogue + inspect-only financial DLQ
- OD-026 narrowed: webhook replay dual-control **not required**; break-glass still open
- OD-024: reuse ADR-033 MFA freshness; provider remains open

## Alternatives considered

- **Option B (include notification replay):** rejected for H2 — insufficient closed safety vs ADR-031
- **Generic ReplayAnyWork:** rejected — financial bypass risk
- **PrivilegedActionRequest for webhook replay:** rejected — dual control unnecessary for MEDIUM webhook transport replay with merchant `evt_` dedupe; avoid forcing approval engine
- **New WebhookDelivery per manual replay:** rejected — ADR-030 delivery identity is event×endpoint; prefer append attempt
- **Auto restart 5-attempt budget after manual fail:** rejected — unbounded loops

## Related architecture

- [dead-letter-handling](../operations/dead-letter-handling.md)
- [admin-access](../security/admin-access.md)
- [financial-integrity](../security/financial-integrity.md)
- [phase-h2-admin-decision-gate](../implementation/phase-h2-admin-decision-gate.md)
- SEQ-OPS-003 / SEQ-OPS-005; LikeC4 `dlqReplay`
