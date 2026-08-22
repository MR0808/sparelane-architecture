---
id: ADR-030
title: Merchant Webhook Contract, Signing and Delivery Policy
status: Accepted
date: 2026-08-22
deciders: Architecture
consulted: Integrations / Security / Operations / Product
informed: Platform engineering
supersedes: []
related:
  - ADR-009
  - ADR-011
  - ADR-014
  - ADR-017
  - ADR-019
  - ADR-020
  - ADR-022
  - ADR-023
  - OD-005
  - OD-031
  - OD-034
---

# ADR-030 — Merchant Webhook Contract, Signing and Delivery Policy

## Status

**Accepted**

Unblocks platform **G0** (merchant webhook domain, contracts, signing, SSRF, projection, delivery identity, retry) without inventing consumer notification contact/copy, a real email/SMS vendor, or Merchant API endpoint CRUD (OD-034).

## Context

[ADR-009](./ADR-009-signed-at-least-once-webhooks.md) requires signed, at-least-once merchant webhooks with stable event IDs. [ADR-023](./ADR-023-curated-external-events.md) requires a curated external contract, not the internal bus.

Platform G0 correctly stopped because architecture left as **Proposed/TBD**:

1. closed external event catalogue
2. outbound envelope / versioning
3. signing algorithm, input, headers, encoding
4. timestamp / replay guidance
5. URL validation / SSRF
6. endpoint verification-before-ACTIVE
7. retry timings / attempt limit ([OD-031](./open/OD-031-webhook-retry-bounds.md))
8. notification use cases, contact ownership, channels, preferences, templates ([OD-005](./open/OD-005-notification-rules.md))

This ADR freezes the **MVP merchant webhook contract + delivery policy**. Consumer email/SMS remain in canonical Phase G but are **sequenced later**.

---

## Decision summary (binding)

| # | Decision |
| --- | --- |
| 1 | **Phase G MVP sequencing:** G0/G1 implement **merchant webhooks only**. Consumer notifications deferred (Option A). Canonical Phase G still includes notifications. |
| 2 | Closed external catalogue in §2. Names are dotted public types, **not** internal PascalCase. |
| 3 | Envelope = `{ id, type, version, createdAt, livemode, merchantId, data }` — `version` is integer schema version of `type`. |
| 4 | `WebhookEvent` = one logical merchant event (`evt_…`). `WebhookDelivery` = event + endpoint. Attempts are children. |
| 5 | Payload: public IDs + merchant refs + money + high-level status/reason. **No** consumer PII, internal UUIDs, secrets, tokens, bank/PAN. |
| 6 | Merchant ownership from **authoritative DB relations**, never from untrusted payload `merchantId`. |
| 7 | Endpoint is merchant-owned. Subscriptions = `event_types[]` (empty = all MVP types). |
| 8 | Lifecycle `ACTIVE` / `DISABLED` / `REVOKED`. **No** verification challenge in MVP. |
| 9 | Production/sandbox SSRF table in §11. Local/test loopback only with explicit opt-in. |
| 10 | HMAC-SHA256; sign `{unix_seconds}.{rawBody}` over **exact bytes sent**; lowercase hex. |
| 11 | Secret shown **once**; recoverable via `signing_secret_ref` (not one-way hash). Rotation **deferred**. |
| 12 | HTTP 2xx = transport success. Retry schedule resolves OD-031 (§18). Independent of payment retry. |
| 13 | Exhaustion → delivery `FAILED`; do **not** auto-disable endpoint; do **not** mutate financial state. |
| 14 | Operator replay of webhook HTTP **deferred** to Phase H tooling. Semantics reserved in §21. |
| 15 | Inbound **provider** webhooks ≠ outbound **merchant** webhooks. |

---

## 1. Phase G MVP scope (Option A)

Canonical Phase G remains **Notifications & Webhooks** ([build-phases](../implementation/build-phases.md)).

**Engineering decomposition** (not extra canonical phases):

| Slice | Scope |
| --- | --- |
| **G0** | Merchant webhook domain, catalogue, envelope, signing, SSRF, projection, delivery identity, retry policy, Fake/local HTTP sink |
| **G1** | Endpoint management (portal/internal), production-safe HTTP delivery against ACTIVE endpoints |
| **G2+** | Consumer notifications — **blocked** until contact ownership, use cases, channels, preferences, templates are Accepted |

Email/SMS **vendor** remains TBD. Existence of `EmailProvider` / `SmsProvider` ports does **not** pull notifications into G0.

OD-034 remains **open**: webhook endpoints are **portal/internal-command** managed for MVP; no Merchant API CRUD required.

---

## 2. Closed external catalogue (MVP)

External names use **`{domain}.{past-tense-or-state}`** lowercase dotted identifiers.

Unsupported internal events **must not** be published.

| External type | version | Source internal event | Merchant derivation | Why a merchant needs it |
| --- | --- | --- | --- | --- |
| `bill.accepted` | 1 | `BillAccepted` | Bill.`merchant_id` | Bill ingested; merchant bill reference accepted |
| `payment.action_required` | 1 | workflow → `ACTION_REQUIRED` | PaymentWorkflow/Bill.`merchant_id` | Consumer/merchant intervention needed |
| `payment.collected` | 1 | `PaymentCollected` | PaymentWorkflow/Bill.`merchant_id` | Funds collected — **not** settled |
| `payment.failed` | 1 | `PaymentFailed` | PaymentWorkflow/Bill.`merchant_id` | Terminal collection failure; merchant resumes own collection |
| `settlement.submitted` | 1 | `SettlementSubmitted` | Settlement.`merchant_id` | Payout submitted / parked SUBMITTED — **not** SETTLED |
| `settlement.settled` | 1 | `SettlementSettled` | Settlement.`merchant_id` | Payout finalised (ledger payout journal exists) |
| `settlement.failed` | 1 | `SettlementFailed` | Settlement.`merchant_id` | Payout failed; collection remains COLLECTED |

**Not in MVP catalogue**

| Candidate | Reason |
| --- | --- |
| `payment.preauthorised` | Product path is single-step collection; preauth is not MVP merchant contract |
| `settlement.processing` | Internal PROCESSING is recon-only; merchant sees `settlement.submitted` then settled/failed |
| Internal names (`PaymentCollected`, outbox types, ledger events) | ADR-023 |

Exact `data` schemas: [webhook-events.md](../contracts/webhook-events.md).

### Projection identity (idempotent)

| type | Deterministic `source_identity` |
| --- | --- |
| `bill.accepted` | `bill:{billPublicId}` |
| `payment.collected` | `pay:{paymentPublicId}` |
| `payment.failed` | `pay:{paymentPublicId}` |
| `settlement.submitted` | `set:{settlementPublicId}` |
| `settlement.settled` | `set:{settlementPublicId}` |
| `settlement.failed` | `set:{settlementPublicId}` |
| `payment.action_required` | `pay:{paymentPublicId}:v{workflowVersion}` at the ACTION_REQUIRED transition |

Unique: `(merchant_id, type, source_identity)`. Redelivered internal events reuse the same `evt_…`.

---

## 3. Envelope and versioning

JSON object, UTF-8, object key order **exactly**:

```json
{
  "id": "evt_01HXYZ...",
  "type": "payment.collected",
  "version": 1,
  "createdAt": "2026-09-01T10:15:30.000Z",
  "livemode": false,
  "merchantId": "mrc_...",
  "data": {}
}
```

| Field | Rule |
| --- | --- |
| `id` | Public `evt_…`. Stable for the logical event. Same on every retry and every endpoint. |
| `type` | Closed catalogue value |
| `version` | Integer schema version of **this type**. MVP = `1`. Additive optional `data` fields are compatible. Breaking `data` change increments `version` (same `type`) or introduces a new `type`. |
| `createdAt` | RFC3339 UTC with milliseconds. **Original projection time.** Unchanged on retry. |
| `livemode` | `true` iff delivering endpoint `environment` is LIVE; else `false` |
| `merchantId` | Public `mrc_…` of owning merchant |
| `data` | Type-specific object only |

No `correlationId`. No internal UUIDs. No envelope-version field separate from `version`.

Merchant API remains `/v1` ([ADR-022](./ADR-022-versioned-external-contracts.md)). Webhook `version` is **per-type schema**, not URI major.

Serialization for HTTP body = compact JSON (no insignificant whitespace) with the field order above. **Those exact bytes** are signed and sent.

---

## 4. Payload minimisation

**Allowed in `data`:** public resource IDs (`bill_`, `pay_`, `conn_`, `set_`), merchant correlation refs, ADR-021 money `{ value, currency }`, date-only `dueDate`, RFC3339 timestamps, high-level `status`, high-level non-sensitive `reasonCode` already used for merchant-visible workflow outcomes.

**Forbidden:**

- internal UUIDs
- API credentials / hashes
- provider tokens, provider payloads, PSP/settlement refs
- payout destination references / bank details
- PAN / CVV / CHD
- authentication subjects / IdP emails
- consumer email, phone, name, or other PII
- ledger account codes / journal IDs
- stack traces / raw HTTP bodies from providers
- webhook signing secrets

MVP merchant webhooks **do not** include consumer PII.

---

## 5. Endpoint ownership, subscriptions, lifecycle

- Exactly one `merchant_id`. ID possession is **not** authorisation ([ADR-014](./ADR-014-merchant-tenant-isolation.md), [ADR-020](./ADR-020-opaque-public-identifiers.md)).
- Merchant A cannot view, update, disable, rotate, test, or deliver against Merchant B’s endpoint.

**Subscriptions:** `event_types text[]`

| Value | Meaning |
| --- | --- |
| empty / omitted | subscribe to **all** MVP catalogue types |
| non-empty | allowlist; every entry **must** be a catalogue type |

Unknown types rejected. Filtering applied at **delivery** (ACTIVE + subscription match).

**Statuses:** `ACTIVE` | `DISABLED` | `REVOKED`

| From | To |
| --- | --- |
| (create after URL + secret issuance) | `ACTIVE` |
| `ACTIVE` | `DISABLED`, `REVOKED` |
| `DISABLED` | `ACTIVE` (re-validate URL), `REVOKED` |
| `REVOKED` | terminal |

Only `ACTIVE` receives new attempts. Recheck status **before each attempt**. If not ACTIVE → no HTTP; logical delivery `CANCELLED`; `error_class = endpoint_not_active`.

**Verification (MVP): Option B** — no HTTP challenge. Merchant-admin-created endpoint becomes `ACTIVE` after URL/SSRF validation and secret issuance. Challenge-before-ACTIVE is deferred.

---

## 6. SSRF and URL policy

Apply **before persist** and **before each connect**.

### Production and sandbox

| Rule | Binding |
| --- | --- |
| Scheme | `https` only |
| Userinfo | Forbidden |
| Fragment | Forbidden |
| Port | 443 only (default HTTPS; explicit non-443 forbidden) |
| DNS | Resolve hostname; connect only to resolved addresses that pass the IP denylist |
| Rebinding | Re-resolve at connect; if addresses fail denylist, abort |
| Redirects | **Do not follow** (max redirects = 0) |
| Credentials in URL | Forbidden |

**IP denylist (resolved addresses):** loopback (`127.0.0.0/8`, `::1`), link-local (`169.254.0.0/16`, `fe80::/10`), RFC1918 (`10/8`, `172.16/12`, `192.168/16`), CGNAT `100.64.0.0/10`, multicast, IPv4-mapped blocked ranges, Unique Local `fc00::/7`, cloud metadata (`169.254.169.254`, `fd00:ec2::254`, and equivalent documented metadata addresses).

### Local and test only

| Rule | Binding |
| --- | --- |
| Opt-in | Explicit config `WEBHOOK_ALLOW_LOOPBACK_SINK=true` (or test fixture equivalent) |
| Allowed extra | `http://127.0.0.1` and `http://localhost` **loopback only**, port in `{80, 443, 8080, 9090}` |
| Not allowed | RFC1918, metadata, other hosts, even in local, unless they pass production HTTPS rules |

Sandbox/production **must not** honour the loopback opt-in.

Blocked destination → no HTTP; security signal `webhook_destination_blocked`; endpoint create rejected.

---

## 7. HTTP client limits

| Limit | Value |
| --- | --- |
| Connect timeout | 5 seconds |
| Overall request timeout | 10 seconds |
| Max response bytes read | 65536 |
| Redirects | 0 |
| TLS | Required except local loopback sink |

Response body is **not** persisted. Read only to honour the byte cap and close.

---

## 8. Signing

| Item | Binding |
| --- | --- |
| Algorithm | HMAC-SHA256 |
| Key | 32 cryptographically random bytes |
| Display | Once at creation: `whsec_` + standard Base64 (no newlines) |
| Storage | Recoverable secret via `signing_secret_ref` (ADR-011). **Not** a one-way hash. Local/test: SecretProvider. Sandbox/production: secrets manager. Never log. |
| Rotation | **Deferred** (capability remains required by ADR-009; not G0/G1) |
| Signed input | ASCII `"{unix_seconds}."` concatenated with **raw HTTP body bytes** |
| Encoding | lowercase hex digest |
| Timestamp | Unix **seconds** (integer) |
| Merchant verify window | ±300 seconds vs receiver clock (documented guidance) |

Headers (exact names):

```text
Sparelane-Event-Id: evt_...
Sparelane-Event-Type: payment.collected
Sparelane-Timestamp: 1755840000
Sparelane-Signature: <64-char lowercase hex>
```

`Sparelane-Event-Id` **must** equal envelope `id`. Timestamp in the header **must** equal the timestamp used in the signing input.

Retry/redelivery: **new** timestamp + **new** signature; **same** body bytes (including original `createdAt`).

Merchant verification spec: [webhook-signing.md](../contracts/webhook-signing.md).

---

## 9. Persistence and delivery identity

```text
WebhookEvent          1 logical merchant event (evt_)
WebhookDelivery       1 per (event, endpoint)     UNIQUE (webhook_event_id, webhook_endpoint_id)
WebhookDeliveryAttempt  1..N per delivery         UNIQUE (webhook_delivery_id, attempt_number)
```

Existing unique `(webhook_event_id, attempt_number)` is **insufficient** for N endpoints. Platform G0 must introduce logical **WebhookDelivery** (or equivalent uniqueness on event+endpoint+attempt).

`WebhookEvent.payload` stores the curated envelope `data` (and enough to rebuild the canonical body). Internal event bus payloads are not stored as the merchant body.

Attempt numbers start at **1**, append-only.

---

## 10. Success, retry, exhaustion (resolves OD-031)

**Success:** HTTP status **200–299**. Merchant processing success is **not** proven. Body ignored.

**Retryable:** connect failure; timeout; `408`; `425`; `429`; `500–599`.

**Not retryable:** other `4xx` (including `400`, `401`, `403`, `404`, `409`, `410`, `422`); SSRF/policy abort; endpoint not ACTIVE.

**Retry-After:** honour on `429` and `503` only. Wait = `min(parsed_delay, 6 hours)`, at least 1 second. If missing/invalid, use canonical delay.

**Schedule (5 attempts, no jitter):**

| After failed attempt | Delay before next attempt |
| --- | --- |
| 1 | 1 minute |
| 2 | 5 minutes |
| 3 | 30 minutes |
| 4 | 6 hours |
| 5 | none — exhausted |

Attempt 1 is immediate after projection (subject to ACTIVE check).

Independent of payment retry ([ADR-025](./ADR-025-payment-retry-timing-budget-and-recovery-window.md)). Webhook failure **never** changes Bill, PaymentWorkflow, PaymentAttempt, Ledger, Settlement, or SettlementInstruction.

**Exhaustion:** logical delivery `FAILED`. Do not auto-disable endpoint. Durable delivery row is SoT. Worker processing DLQ may hold a **pointer** (delivery id / public event id), **not** a second copy of the merchant payload. Operator HTTP replay UI is **Phase H**.

---

## 11. Duplicates and disabled endpoints

At-least-once: merchants **must** dedupe on envelope `id`.

N ACTIVE subscribed endpoints → N deliveries, **same** `evt_…`.

If endpoint is disabled/revoked after projection: skip HTTP; delivery `CANCELLED`.

---

## 12. Provider vs merchant webhooks

| | Inbound provider | Outbound merchant |
| --- | --- | --- |
| Direction | Provider → Sparelane | Sparelane → merchant |
| Persistence | `ProviderEventReceipt` | `WebhookEvent` / Delivery / Attempt |
| Auth | Provider scheme (OD-008/009) | This ADR HMAC |
| May move money | Only after verify | Never |

---

## 13. Commands, worker, Fake, finance

```text
internal domain event
→ ProjectMerchantWebhook (idempotent)
→ WebhookEvent
→ WebhookDelivery per ACTIVE subscribed endpoint
→ DeliverMerchantWebhook (HTTP outside DB transaction)
→ append WebhookDeliveryAttempt
→ SUCCEEDED | schedule retry | FAILED | CANCELLED
```

Internal commands stay PascalCase. External types stay dotted.

**notification-worker** owns outbound merchant webhook delivery ([ADR-018](./ADR-018-logical-vs-physical-services.md), [ADR-019](./ADR-019-financial-workload-isolation.md)). Payment/settlement workers must not HTTP-deliver merchant webhooks.

Fake/local HTTP sink: **nonProductionOnly**. Production/sandbox fail closed without a real HTTPS client; no Fake auto-select.

---

## 14. Observability, audit, security

**Metrics labels allowed:** `type`, `outcome`, `error_class` (bounded). **Forbidden labels:** merchantId, endpointId, event id, URL, email.

**Spans:** `webhook.project`, `webhook.deliver`, `webhook.sign`. No secret/body attributes.

**Logs:** event `type`, outcome, HTTP status class, attempt number, correlation id. Never secret, signature input, Authorization, full body.

**Audit:** endpoint created / disabled / revoked / subscription changed. Successful automated delivery = delivery row, not audit. Manual replay (when added) = audit.

**Security signals:** SSRF blocked; cross-tenant endpoint action; signing-secret misuse if detectable. Ordinary `5xx` from merchant = **not** a security incident.

---

## 15. Deferred notifications (not blocking webhooks)

Remain open ([OD-005](./open/OD-005-notification-rules.md)):

- consumer contact destination (auth email is **not** notification destination)
- use-case catalogue and copy
- email vs SMS MVP
- preferences / opt-out
- templates / versioning
- notification intent idempotency

Do **not** create a notification ADR until those can be Accepted without invention.

---

## Consequences

### Positive

- G0 can implement without guessing signing, SSRF, catalogue, or retry bounds
- merchants get a stable, minimised, signed contract
- financial isolation preserved

### Negative / tradeoffs

- notifications wait on contact/copy decisions
- no challenge-handshake increases risk of typo URLs (mitigated by SSRF + merchant-admin auth)
- secret rotation deferred (operational follow-up)
- merchants must implement HMAC verify + idempotency

## Alternatives considered

1. **Option B/C (notifications in G0)** — rejected; no contact model; would invent email ownership.
2. **Reuse internal PascalCase types** — rejected; couples merchants to internals (ADR-023).
3. **HTTP allowed in production** — rejected; SSRF and integrity.
4. **Follow redirects** — rejected; redirect-based SSRF.
5. **Hash-only webhook secret** — rejected; HMAC needs recoverable key.
6. **Copy payment retry schedule** — rejected; different risk and duration.
7. **Challenge-before-ACTIVE** — deferred; not specified as a protocol today.

## Dependencies / open questions

- OD-005 consumer notification rules — **open** (does not block G0 webhooks)
- OD-034 webhook endpoint Merchant API — **open** (portal/internal for MVP)
- OD-025 secrets product — **open** (ref + SecretProvider sufficient for local)
- Signing secret rotation protocol — deferred
- Endpoint verification challenge — deferred

## Related architecture

- LikeC4: `merchantWebhookDelivery`, `merchantWebhookRetry`
- Docs: [webhooks.md](../integrations/webhooks.md), [webhook-events.md](../contracts/webhook-events.md), [webhook-envelope.md](../contracts/webhook-envelope.md), [webhook-signing.md](../contracts/webhook-signing.md)
- Schema: [relational-model.md](../schema/relational-model.md)
- Resolves: [OD-031](./open/OD-031-webhook-retry-bounds.md)
- Complements: ADR-009 (delivery semantics), ADR-023 (curation principle)
