---
id: ADR-039
title: MVP Settlement Provider Selection
status: Accepted
date: 2026-08-25
deciders: Architecture
consulted: Money / Settlement / Integrations
informed: Platform engineering / Product / Legal (production gate)
supersedes: []
related:
  - ADR-006
  - ADR-026
  - ADR-027
  - ADR-028
  - ADR-029
  - ADR-037
  - ADR-038
  - OD-009
  - OD-010
  - OD-025
---

# ADR-039 — MVP Settlement Provider Selection

## Status

**Accepted**

Resolves [OD-009](./open/OD-009-settlement-partner.md). Selects **Stripe Connect manual payouts** as the MVP `SettlementProvider` under [ADR-037](./ADR-037-collection-funds-flow-merchant-of-record.md) and [ADR-038](./ADR-038-mvp-payment-service-provider-selection.md). Does **not** implement an adapter and does **not** claim LIVE_EVIDENCE.

**Research access date:** 2026-08-25 (official Stripe Connect payout / fee / balance / idempotency documentation).

## Context

Phase F (ADR-027/028/029) defines a Settlement domain that submits one `SettlementInstruction` per Settlement and marks `SETTLED` only after provider-normalised finality + payout journal. ADR-037 classifies Sparelane as `NO_CUSTODY` with funds in merchant connected/sub-merchant balances. ADR-038 selected Stripe Connect **direct charges**.

OD-009 must prove Stripe Connect payouts can implement that Settlement contract **without** inventing custody or silently changing gross Settlement economics.

## Decision

### Selected provider

| Field | Binding |
| --- | --- |
| SettlementProvider | **Stripe Connect** (same platform as ADR-038 PSP) |
| Execution model | **Option A — MANUAL PAYOUT on connected account** |
| Operation | `POST /v1/payouts` with `Stripe-Account: acct_…` |
| Provider code | `stripe` (settlement) |
| Automatic payout schedule | **Must be disabled** (`payments.payouts.schedule.interval = manual`) for MVP connected accounts Sparelane settles |
| Instant payouts | **Not** MVP |

### Rejected execution models

| Option | Verdict |
| --- | --- |
| B — Stripe automatic payout schedule | Rejected — Sparelane cannot guarantee 1 Settlement → 1 payout / instruction identity |
| C — Transfer + payout / destination-charge rails | Rejected — conflicts ADR-037/038 direct-charge NO_CUSTODY path |
| D — Separate banking partner | Not required — Stripe satisfies hard settlement semantics under bindings below |

## Phase F reinterpretation (confirmed)

Under ADR-037 + this ADR:

> **Settlement** is Sparelane’s orchestration and accounting evidence that a **gross** merchant payable obligation (one confirmed collection) is discharged by a **provider-mediated payout** from the merchant’s **Stripe connected-account balance** to that merchant’s verified external bank destination.

| Concept | Meaning |
| --- | --- |
| Merchant payable | Operational liability tracking — **not** Sparelane custodian liability for client money |
| Settlement obligation | Payout orchestration obligation for that collection amount |
| SettlementInstruction | One Stripe Payout create attempt identity |
| `SETTLED` | Stripe Payout finality `paid` (+ journal) — not Sparelane bank cash |
| Custody | Unchanged: Sparelane **`NO_CUSTODY`**; funds remain provider-controlled until paid to merchant bank |

Manual payout initiation is **instruction authority** over merchant-owned provider balance, not Sparelane pooling of funds. Production AU legal review (ADR-037) remains required.

## Connected-account configuration (frozen with ADR-038)

MVP connected accounts **must**:

| Setting | Binding |
| --- | --- |
| Charge model | Direct charges ([ADR-038](./ADR-038-mvp-payment-service-provider-selection.md)) |
| `card_payments` | Active |
| Fee collector | **`fees_collector = application`** (Accounts v2) / equivalent **platform pays Stripe processing fees** (Accounts v1 `controller.fees.payer = application`) |
| Payout schedule | **Manual** |
| Platform payout control | Platform can create payouts for the connected account (controller/platform-controls as required by Stripe for that account shape) |
| Country / currency | AU connected accounts; **AUD** presentment and payout; **no FX** in MVP |

### Gross Settlement ↔ Stripe fees (hard gate — resolved)

ADR-027/028/029 Settlement amount is **gross** Bill/collection amount. Stripe processing fees, if deducted from the connected account (`fees_collector = stripe`), would make available balance **less than** gross Settlement and break executable gross payout.

**Binding resolution (no ADR-026/027/029 CoA change):**

- Configure connected accounts so **Stripe payment processing fees are billed to the Sparelane platform** (`fees_collector = application`).
- Connected-account balance therefore receives the **gross** captured amount (pending→available timing still applies).
- Sparelane **SaaS/transaction fees** remain **separately invoiced** (ADR-037) — not Stripe application-fee netting of journals.
- Platform treats Stripe processing fees as **platform COGS** (commercial variable cost) — outside MVP settlement journals.
- Net-of-fee Settlement amounts and fee legs in CoA remain **deferred** (ADR-027 production net-payout blocker stays closed for *net* policy; MVP executes **gross**).

Insufficient **available** balance at submit time (pending funds, prior refunds/chargebacks, concurrent payouts) → provider **`rejected`** or pre-submit hold — **not** silent amount reduction.

## Payout destination

| Field | Binding |
| --- | --- |
| `provider_destination_ref` | Stripe external bank account id on the connected account (`ba_…`) |
| Storage | Merchant payout destination token/reference only — **no** raw BSB/account numbers |
| Ownership | Destination **must** belong to the Settlement merchant’s `providerAccountRef` (`acct_…`) |
| Submit | Pass `destination = ba_…` on Payout create (required for Sparelane-selected destination; do not rely on silent Stripe default alone) |
| Verification | Sparelane marks destination ACTIVE only when: (1) `ba_…` exists on that `acct_…`, (2) connected account is payouts-capable, (3) Stripe does not report the external account as disabled/errored for payouts. Recheck before submit. Exact Stripe bank “verified” enums vary by country — normalise to Sparelane ACTIVE/verified; fail closed if unusable. |

Default-per-merchant+currency (ADR-028) remains. Destination-change race: re-resolve ACTIVE destination + ownership immediately before submit; if Stripe rejects invalid destination → `rejected`.

## SettlementProvider request mapping

Domain already carries merchant on Settlement. Adapter **must** resolve `Stripe-Account` from authoritative merchant `providerAccountRef` — never from bill/consumer/headers.

```text
submitInstruction:
  Stripe-Account: acct_… (merchant providerAccountRef)
  POST /v1/payouts
    amount = Settlement.amountMinor (gross)
    currency = Settlement.currency (AUD)
    destination = ba_… (destinationReference)
    metadata.sparelane_settlement_public_id = settlementPublicId
    metadata.sparelane_reconciliation_reference = reconciliationReference
  Idempotency-Key: settlement-instruction:{settlementPublicId}
```

## Instruction identity / idempotency

| Rule | Binding |
| --- | --- |
| Key | `settlement-instruction:{settlementPublicId}` (ADR-028) — fits Stripe ≤255 chars |
| Scope | Per Stripe platform + connected-account request context |
| Replay | Same key + same params → same Payout result body within retention |
| Conflict | Same key + changed params → fail-closed; **never** new key |
| Retention | Stripe may prune ≥ **24 hours** — reconcile/lookup before late re-POST; never mint a new key after prune |

## providerInstructionRef

Stripe Payout id: **`po_…`**. Persist on `accepted`. Stable for retrieve.

## Execute taxonomy (ADR-028)

| Stripe / adapter evidence | Outcome |
| --- | --- |
| Payout object created (`status` typically `pending`) | `accepted` → Settlement **SUBMITTED**; instruction ACCEPTED — **not SETTLED** |
| Synchronous reject (insufficient available funds, invalid destination, payouts disabled, currency) | `rejected` |
| Proven no-create (pre-accept network/clear validation) | `technical_error` |
| Timeout / ambiguity after request may have reached Stripe | `unknown_outcome` → SUBMITTED + OUTCOME_UNKNOWN + reconcile hold |

## Crash-after-accept recovery (hard)

```text
1. Claim submit TX / persist intent
2. POST /v1/payouts with Idempotency-Key = settlement-instruction:{settlementPublicId}
3. Crash before storing po_…
4. Replay: identical POST with same key
5. Within retention → Stripe returns original Payout → store po_… → accepted path
6. If only unknown and key possibly pruned: lookup by metadata list/filter on connected account
   and/or operator integrity hold — NEVER new idempotency key, NEVER second logical payout
```

## Reconciliation / finality (ADR-029)

| Stripe Payout `status` | Canonical finality |
| --- | --- |
| `pending`, `in_transit` | `pending` (Settlement SUBMITTED/PROCESSING per FSM) |
| `paid` | `settled` → payout journal (gross) → Settlement **SETTLED** |
| `failed`, `canceled` (definitive) | `failed` → Settlement FAILED; **no** payout journal |
| Retrieve missing `po_…` | `not_found` → integrity hold; no resubmit; no SETTLED |
| Ambiguous | `unknown` → hold |

**MVP SETTLED evidence:** provider-adapter-normalised **`paid`** from verified webhook (`payout.paid`) **and/or** retrieve — **not** bank statement file; **not** payout create/`pending`.

Lookup = correctness; webhook = acceleration (ADR-029). Webhook signing = Stripe `Stripe-Signature` / `whsec_` — distinct from ADR-030 merchant HMAC.

Reconciliation **never** calls `submitInstruction`.

## One Settlement → one Payout

MVP: **1 Settlement → 1 SettlementInstruction → 1 Stripe Payout**. No batching (ADR-028). Aggregate connected balance is fungible provider detail; payout amount remains the Settlement gross obligation.

## Currency

AUD only for MVP AU pilot. No FX. Destination currency must match Settlement currency.

## Negative balance / disputes

Out of MVP product scope. If available balance insufficient or payouts blocked → `rejected` / hold. Do not invent chargeback CoA here.

## OD-025 secrets

Settlement adapter uses the same Stripe platform secret key (connected-account header) and optional payout webhook signing secret as ADR-038, retrieved via [ADR-040](./ADR-040-mvp-managed-secrets-and-key-management-policy.md) Secrets Manager. No separate banking partner secrets for MVP.

## Fake / production

FakeSettlementProvider remains local/CI only. Production/sandbox fail-closed without this approved provider + adapter (`assertProductionSafeSettlementProvider`).

## Deferred

- Net settlement / fee legs in CoA
- Automatic Stripe payout schedules
- Instant payouts
- Multi-currency
- Separate settlement bank partner
- Bank-statement finality

## Consequences

### Positive

- OD-009 closed with same-vendor Connect stack
- Gross ADR-027/028/029 journals preserved via `fees_collector=application`
- Manual payout matches SettlementInstruction semantics
- Crash recovery via Stripe idempotency
- Finality queryable (`po_…` / `paid`)

### Negative / follow-ups

- Stripe settlement adapter EXTERNAL_IMPLEMENTATION
- Connected-account onboarding must set fee collector + manual schedule
- Platform bears Stripe processing fees (commercial COGS)
- 24h idempotency retention ops discipline
- OD-025 secrets architecture closed (ADR-040); backends EXTERNAL_IMPLEMENTATION before live keys
- AU legal review before production

## Alternatives considered

- STOP for unresolved fee/netting — rejected because `fees_collector=application` keeps **gross** executable without CoA change
- Automatic payouts — rejected (breaks 1:1 instruction)
- External bank partner — unnecessary complexity / custody risk under ADR-037

## Related architecture

- `docs/implementation/stripe-connect-settlement-adapter-checklist.md`
- `docs/implementation/mvp-acceptance-gap-plan.md`
- ADR-027/028/029/037/038
