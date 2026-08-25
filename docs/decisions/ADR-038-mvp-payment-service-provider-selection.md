---
id: ADR-038
title: MVP Payment Service Provider Selection
status: Accepted
date: 2026-08-25
deciders: Architecture
consulted: Integrations / Money / Security
informed: Platform engineering / Product / Legal (production gate)
supersedes: []
related:
  - ADR-001
  - ADR-010
  - ADR-021
  - ADR-024
  - ADR-026
  - ADR-028
  - ADR-029
  - ADR-037
  - OD-008
  - OD-009
  - OD-010
  - OD-025
---

# ADR-038 — MVP Payment Service Provider Selection

## Status

**Accepted**

Resolves [OD-008](./open/OD-008-psp-selection.md). Selects **Stripe Connect** as the MVP PSP under [ADR-037](./ADR-037-collection-funds-flow-merchant-of-record.md). Does **not** implement an adapter, does **not** resolve OD-009/023/025, and does **not** claim live sandbox evidence.

**Research access date:** 2026-08-25 (official Stripe / Adyen / Airwallex / Pin docs).

## Context

Track 2 STOPPED pending OD-036; Track 2A Accepted ADR-037 (`CONNECTED_SUB_MERCHANT_ORCHESTRATOR`, merchant MoR, Sparelane `NO_CUSTODY`). OD-008 required a single vendor that satisfies ADR-037 hard criteria plus the existing `PaymentProvider` contract without material PaymentMethod redesign.

## Decision

### Selected provider

| Field | Binding |
| --- | --- |
| Vendor | **Stripe** |
| Product / family | **Stripe Connect** (platform + connected accounts) |
| Charge model | **`DIRECT_CHARGE` only** for MVP card collection |
| Provider code | `stripe` |
| Environment | Distinct test vs live Stripe platforms; never cross-wire keys or `acct_` refs |

### Why this charge model

Official Connect charge types ([docs.stripe.com/connect/charges](https://docs.stripe.com/connect/charges), accessed 2026-08-25):

| Model | ADR-037 fit |
| --- | --- |
| **Direct charges** | Connected account is MoR; funds land in **connected account balance**; SaaS platforms are an explicit use case — **selected** |
| Destination charges | Charge created on **platform** balance then transfer — conflicts with Sparelane `NO_CUSTODY` / initial funds destination — **rejected for MVP** |
| Separate charges + transfers | Platform balance custody — **rejected for MVP** |
| Destination / SCT with `on_behalf_of` | Can shift MoR/descriptor but still routes via platform charge patterns — **not MVP path** |

Application fees on direct charges are **optional** and **must not** be used to net ADR-026/029 journals for MVP (Sparelane SaaS fees remain separately invoiced per ADR-037).

### providerAccountRef

| Rule | Binding |
| --- | --- |
| Value | Stripe Connected Account ID (`acct_…`) |
| Source | Authoritative merchant/provider configuration only |
| Mandatory | Live + sandbox money paths |
| Forbidden sources | Bill payload, consumer input, request headers |
| Environment | Separate `acct_` per test/live; scoped with Stripe mode |
| Capability gate | Connected account must have **`card_payments`** capability **active** before `executePayment` |

### Tokenisation / multi-merchant reuse

| Rule | Binding |
| --- | --- |
| Classification | **`SUPPORTED_VIA_PROVIDER_PATTERN`** |
| Consumer save | Platform-scoped Stripe Customer + SetupIntent + **Stripe Elements** (or Checkout/Payment Element equivalent) — no PAN/CVV to Sparelane |
| `PaymentMethod.provider` | `stripe` |
| `PaymentMethod.providerTokenRef` | Platform PaymentMethod id (`pm_…`) |
| Cross-merchant reuse | Official **PaymentMethod cloning** to the target connected account before direct charge ([docs.stripe.com/connect/direct-charges-multiple-accounts](https://docs.stripe.com/connect/direct-charges-multiple-accounts)) |
| Schema change | **Not required** — adapter clones on demand (or caches clone mapping internally); Sparelane continues to store one consumer-owned platform `pm_…` |
| Recurring note | Clone may be consumed per charge; adapter may create connected-account Customer + attach clone for reuse — adapter-local, not domain schema |

### Payment execution (conceptual)

```text
Inputs (Sparelane → adapter):
  providerAccountRef = acct_…
  paymentMethodReference = pm_… (platform)
  amountMinor, currency=AUD
  idempotencyKey = PaymentAttempt.publicId
  workflowReference, attemptReference (safe metadata)

Adapter steps:
  1. Assert merchant providerAccountRef + card_payments ready
  2. Clone platform PaymentMethod to connected account (Stripe-Account: acct_…)
  3. Create+confirm PaymentIntent on connected account:
       amount, currency, payment_method=cloned_pm,
       confirm=true, off_session=true,
       capture_method=automatic,
       Idempotency-Key: attempt.publicId
       metadata: sparelane_attempt, sparelane_workflow (public ids only)

Return mapping:
  PaymentIntent.status = succeeded (+ funds captured) → success + providerReference=pi_…
  card/issuer decline / requires_payment_method after fail → declined (+ safe hints)
  requires_action / next_action (e.g. 3DS) → not success;
       map into Sparelane ACTION_REQUIRED path (durable pi_ + client_secret in safe metadata)
       — consumer portal completion is downstream implementation
  clear pre-accept network/4xx validation with proven no object → technical_error
  timeout / connection drop after request may have reached Stripe → unknown_outcome
```

**No raw Stripe objects** leak into domain enums or merchant contracts.

### Success semantics

`PaymentAttempt → CAPTURED` only when adapter maps **confirmed collection success**:

- PaymentIntent `status = succeeded` with automatic capture (MVP), **or**
- equivalent documented captured state if capture_method ever differs (not MVP)

Not sufficient: `processing` alone; `requires_capture` without capture (MVP uses automatic capture); mere HTTP 200 without succeeded status.

### Decline semantics

Adapter returns `declined` with transport-safe hints only (`issuer` | `insufficient_funds` | `do_not_honour` | `expired` | `other` + optional provider codes). **ADR-024 / D4** owns RETRYABLE vs NON_RETRYABLE. Do not embed recovery policy in the adapter.

### technical_error vs unknown_outcome

| Outcome | When |
| --- | --- |
| `technical_error` | Proven no charge created (connection failure before accept; clear validation rejection with no PaymentIntent side effect) |
| `unknown_outcome` | Ambiguous after request could have reached Stripe (timeouts, dropped responses, 5xx after send ambiguity) |

Bias to `unknown_outcome` when unsure. **Never** blind resubmit with a new idempotency key.

### Idempotency

| Rule | Binding |
| --- | --- |
| Key | `PaymentAttempt.publicId` as Stripe `Idempotency-Key` header |
| Format | Up to **255** characters — Sparelane public ids fit |
| Retention | Stripe may prune keys after **≥ 24 hours** ([docs.stripe.com/api/idempotent_requests](https://docs.stripe.com/api/idempotent_requests)) |
| Operational consequence | After prune, replaying the same key may create a **new** request — Sparelane must **lookup/reconcile** before any re-POST; never use a new key to bypass conflict |
| Parameter conflict | Same key + changed params → Stripe conflict error → integrity / fail-closed; **never** mint a new key |

### Provider reference

Canonical `providerReference` for a successful/attempted charge = PaymentIntent id (`pi_…`). Persist for lookup. Clone `pm_…` ids are adapter-ephemeral unless cached.

### Lookup / UNKNOWN recovery

1. Execute times out ambiguously → `unknown_outcome`; Attempt stays SUBMITTED.  
2. Reconcile: if `providerReference` known → `GET /v1/payment_intents/{pi}` with `Stripe-Account: acct_…`.  
3. If only idempotency key known and within retention → **safe re-POST** of identical create+confirm (Stripe returns original result).  
4. Map: succeeded → CAPTURED; definitive decline/canceled → terminal decline/error path; `processing` / incomplete → `still_unknown` hold; Stripe temporary outage → `temporary_failure`.  
5. **Never** generate a new idempotency identity for the same attempt.

Lookup = **correctness path**. Webhooks = **optional acceleration**.

### Webhooks (optional MVP)

If used: Stripe signed events (`Stripe-Signature`); verify with webhook signing secret; Connect account events may include connected-account context. Distinct from ADR-030 merchant outbound webhooks. Not required for correctness if lookup works.

### 3DS / ACTION_REQUIRED

| Case | Binding |
| --- | --- |
| Setup (save card) | SetupIntent may require authentication — Elements/client handles during onboarding |
| Off-session collection | Unexpected `requires_action` → Sparelane **ACTION_REQUIRED** (existing workflow state) with durable `pi_` + `client_secret` metadata for consumer completion |
| Downstream | Consumer portal payment-auth completion UI is **implementation after this ADR** — not a selection STOP (architecture already has ACTION_REQUIRED) |

Do not silently treat `requires_action` as success or as technical_error.

### Connected-account onboarding / KYB

| Concern | Binding |
| --- | --- |
| Mechanism | Stripe Connect onboarding (Account Links / embedded onboarding / OAuth as product chooses) creating connected accounts with `card_payments` |
| Sparelane gates | Merchant status + `APPROVED_FOR_SETTLEMENT` remain Sparelane |
| Provider gates | Stripe verification + capability active before live charge |
| Eligibility | Both Sparelane **and** Stripe readiness required |

### Sandbox

Stripe test mode must cover: platform + connected account, Elements/SetupIntent tokenisation, direct charge success (`4242…`), declines (e.g. `4000000000009995` insufficient_funds), idempotent replay, PaymentIntent retrieve, webhook signature (if enabled), ACTION_REQUIRED/auth test cards where applicable. Adapter fault-injection supplements non-deterministic timeouts.

### Credentials / OD-025

Future SecretProvider must supply at least:

| Secret | Purpose |
| --- | --- |
| Platform secret API key (`sk_test_` / `sk_live_`) | Server charges, clone, lookup |
| Publishable key (`pk_…`) | Client Elements / SetupIntent |
| Webhook signing secret (`whsec_…`) | If webhooks enabled |
| Connect client id / OAuth secrets | If OAuth onboarding used |

No production FakePaymentProvider. No secrets in source. Credentials via [ADR-040](./ADR-040-mvp-managed-secrets-and-key-management-policy.md) Secrets Manager (OD-025 **resolved**).

### PCI / privacy

- Stripe PCI DSS Level 1 service provider; Elements → Sparelane aims for reduced SAQ scope (typically SAQ A-class when CHD never touches Sparelane servers) — **Sparelane certification not claimed here** (OD-013).  
- Token refs and `acct_` are confidential; never log secrets, PANs, or full client_secrets in durable logs beyond short-lived ACTION_REQUIRED handling policy.

### Settlement / OD-009 consequence

Stripe Connect pays out connected-account balances to merchant banks (automatic/manual/instant per config) ([docs.stripe.com/connect/payouts-connected-accounts](https://docs.stripe.com/connect/payouts-connected-accounts)).

| Effect | Binding |
| --- | --- |
| OD-009 | **Resolved by [ADR-039](./ADR-039-mvp-settlement-provider-selection.md)** — Stripe Connect **manual** payouts |
| Fee collector | MVP connected accounts require **`fees_collector=application`** so gross Settlement amounts remain payable from connected balance (ADR-039) |
| Separate bank partner | Not required for MVP |

### Deferred

Refunds, chargebacks orchestration, preauth product path, network-token portability off Stripe, destination-charge models, application-fee netting in ledgers.

### Rejected alternatives (summary)

| Candidate | Result |
| --- | --- |
| Adyen for Platforms | Capable AU platform; default liable-balance booking + split complexity; recurring token share often company-config; higher pilot onboarding cost — **not selected** |
| Airwallex connected accounts | Credible connected MoR path; weaker proven public evidence for Sparelane’s exact card-on-file clone/reuse + PaymentProvider parity in this gate — **not selected** |
| Pin Payments marketplace | Documented marketplace path **credits platform balance** then Transfers — **PLATFORM_CUSTODY / Option B-like** — **hard eliminate** |
| Pin Merchants API | Partner-created separate merchant accounts ≈ separate vaults — token reuse across merchants **not proven** — **hard eliminate for ADR-037** |

### Production legal caveat

ADR-037 legal-review requirement before live production remains. This ADR is architecture vendor selection, not AFSL/licensing advice.

## Consequences

### Positive

- OD-008 closed with executable Connect direct-charge binding  
- Token reuse preserved without PaymentMethod schema change  
- UNKNOWN recoverable via PaymentIntent retrieve + idempotent replay  
- OD-009 path clarified toward same-vendor payouts  

### Negative / follow-ups

- Real Stripe adapter + conformance suite still required  
- Consumer ACTION_REQUIRED / Elements onboarding UI still to implement  
- Stripe idempotency 24h retention must be respected in ops  
- OD-025 secrets architecture closed ([ADR-040](./ADR-040-mvp-managed-secrets-and-key-management-policy.md)); backends EXTERNAL_IMPLEMENTATION before live keys 

## Alternatives considered

Documented above. STOP considered if no candidate met token reuse + NO_CUSTODY; Stripe direct-charge + clone pattern met both with authoritative docs.

## Related architecture

- `docs/implementation/phase-od-008-psp-decision-gate.md`  
- `docs/implementation/provider-adapters.md`  
- `docs/implementation/mvp-acceptance-gap-plan.md`  
- Requirements INT-PSP-*, FUN-PAY-*  
