---
id: ADR-029
title: Settlement Finality, Reconciliation and Payout Accounting Policy
status: Accepted
date: 2026-08-22
deciders: Architecture
consulted: Money / Settlement / Ledger / Security / Operations
informed: Platform engineering
supersedes: []
related:
  - ADR-004
  - ADR-006
  - ADR-013
  - ADR-016
  - ADR-017
  - ADR-026
  - ADR-027
  - ADR-028
  - OD-009
  - OD-011
---

# ADR-029 — Settlement Finality, Reconciliation and Payout Accounting Policy

## Status

**Accepted**

Unblocks platform **F2** (settlement reconciliation → payout journal → `SETTLED`) without inventing a real banking partner, fee/netting, automatic polling cadence, or bank-statement finality.

## Context

[ADR-027](./ADR-027-settlement-obligation-eligibility-cardinality.md) freezes obligation/eligibility.
[ADR-028](./ADR-028-settlement-execution-payout-destination-instruction-idempotency.md) freezes instruction execution and ends F1 at `SUBMITTED` (ack ≠ `SETTLED`).

Platform F2 correctly stopped because architecture had not frozen:

1. authoritative settlement finality evidence
2. reconciliation evidence hierarchy
3. provider-neutral finality taxonomy
4. provider-not-found semantics
5. reconciliation trigger / cadence
6. payout settlement accounting journal (Dr/Cr, codes, amount, fees)
7. journal `business_reference` and journal-before-`SETTLED`
8. split-store crash/replay semantics for payout journals

This ADR freezes the **MVP finality + payout CoA slice** so F2 can implement:

```text
Settlement SUBMITTED (+ instruction ACCEPTED | OUTCOME_UNKNOWN)
→ ReconcileSettlement (lookup and/or verified webhook)
→ canonical finality outcome
→ payout journal (when settled)
→ Settlement SETTLED + SettlementSettled
```

without guessing.

---

## Decision summary (binding)

| # | Decision |
| --- | --- |
| 1 | **`SETTLED` economic meaning** — see §1 |
| 2 | Authoritative MVP finality = **provider-adapter-normalised** result from **verified webhook and/or lookup** (not bank statement) |
| 3 | Evidence hierarchy frozen (§3); bank/cash file **not** required for MVP `SETTLED` |
| 4 | Canonical taxonomy: `pending` \| `settled` \| `failed` \| `not_found` \| `unknown` |
| 5 | `not_found` → integrity/recon hold; **no** resubmit; **no** `SETTLED`; **no** payout journal |
| 6 | Trigger = **webhook + event-driven lookup**; **no** automatic ScheduledJob poll cadence in MVP |
| 7 | Payout journal: **Dr** merchant payable / **Cr** settlement clearing (gross); **no** fee legs |
| 8 | `business_reference` = `settlement-payout:{settlementPublicId}` |
| 9 | Journal **before** `SETTLED`; split-store (ledger TX then operational TX); no 2PC |
| 10 | Reconciliation **never** calls `submitSettlementInstruction` |
| 11 | Fake only for local/CI; production fail-closed without OD-009 + approved adapter |
| 12 | Fee/net production money remains blocked; gross Fake path is F2 local proof |

---

## 1. Economic meaning of `SETTLED`

**Binding definition:**

> `Settlement.status = SETTLED` means: Sparelane has durable **provider-adapter-normalised finality evidence** that the payout represented by this Settlement’s `SettlementInstruction` **completed**, the evidence **matched** the authoritative local instruction (identity, amount, currency, and destination ref when exposed), and Sparelane has appended the **canonical payout journal** discharging the merchant payable obligation for this Settlement.

It does **not** mean:

- instruction created
- provider request sent
- provider `accepted` / network acknowledgement
- instruction `OUTCOME_UNKNOWN`
- provider recognised the instruction as still in progress (`pending`)
- Sparelane bank cash has been independently reconciled (deferred; not required for MVP `SETTLED`)

---

## 2. Finality options compared

| Option | Model | Verdict |
| --- | --- | --- |
| **A** | Provider lookup final state alone is authoritative | Insufficient as sole channel (missed poll / no poll cadence) |
| **B** | Signed provider webhook alone is authoritative | Insufficient alone (missed webhook / unknown submit) |
| **C** | Provider settlement/reconciliation file required | Rejected for MVP — formats TBD with OD-009 |
| **D** | Bank/cash reconciliation required before `SETTLED` | Rejected for MVP — overstates custody; partner/bank SoT TBD |
| **E** | Multiple sources with frozen hierarchy | **Chosen** — webhook and/or lookup; bank file later independent |

### Binding MVP model

**Authoritative finality** = a **SettlementProvider-adapter-normalised** final result obtained from:

1. a **signature-verified** provider webhook mapped by the adapter, **or**
2. a **lookup** against the **same** provider and instruction identity

into the canonical taxonomy (§4).

Vendor-specific payloads stay inside the adapter. Domain code consumes only canonical outcomes.

**Bank-statement / cash reconciliation is not required** to mark MVP `SETTLED`. It remains a later independent financial-reconciliation concern.

Real vendor selection remains [OD-009](./open/OD-009-settlement-partner.md).

---

## 3. Evidence hierarchy (binding)

When determining finality for one `SettlementInstruction`:

| Rank | Source | Role |
| --- | --- | --- |
| 1 | Verified provider webhook → adapter → canonical `settled` / `failed` / `pending` / `unknown` | Authoritative when present and verified |
| 2 | Provider `lookupSettlementInstruction` → same taxonomy | Authoritative when webhook absent, delayed, or for `OUTCOME_UNKNOWN` recovery; also validates/refresh pending |
| 3 | Provider settlement/bank statement files | **Not** required for MVP `SETTLED`; later independent recon |

Rules:

- Unverified webhook **cannot** settle or fail a Settlement.
- Lookup must use the **original** `SettlementInstruction.provider` and instruction identity — **no provider switch**.
- If webhook and lookup both yield **conflicting terminal** outcomes (`settled` vs `failed`) for the same instruction → **financial-integrity hold**; no `SETTLED`; no payout journal; alert.
- Amount/currency/(destination when exposed) mismatch vs local instruction → integrity conflict; no `SETTLED`.

---

## 4. Canonical reconciliation taxonomy (binding)

Provider-neutral outcomes returned by `reconcileSettlementInstruction` / lookup / verified webhook mapping:

| Outcome | Meaning | Instruction effect | Settlement effect | Payout journal? | Resubmit? |
| --- | --- | --- | --- | --- | --- |
| `pending` | Provider recognises instruction; payout not final | Remain `ACCEPTED` (or stay `OUTCOME_UNKNOWN` until recognised) + recon still open | Remain `SUBMITTED` or → `PROCESSING` | No | No |
| `settled` | Provider proves payout **completed** | Persist finality evidence; terminal success path | After journal → `SETTLED` | **Yes** (required) | No |
| `failed` | Provider proves payout **failed** | Persist failure evidence | `SUBMITTED`/`PROCESSING` → `FAILED` | **No** (no discharge journal) | No (business retry = later phase) |
| `not_found` | Provider has **no** record for this instruction identity | Hold; `reconciliation_required` remains | Remain `SUBMITTED`/`PROCESSING`; integrity/ops hold | No | **No** |
| `unknown` | Inconclusive | Remain hold / `OUTCOME_UNKNOWN` as applicable | Remain non-terminal | No | No |

Do **not** invent extra domain outcomes beyond this set for F2.

F1 submit taxonomy (`accepted` \| `rejected` \| `technical_error` \| `unknown_outcome`) remains for **submission**. F2 finality taxonomy above is for **reconciliation**.

---

## 5. Pending

- Settlement may transition `SUBMITTED` → `PROCESSING` when outcome is `pending` and the provider recognises the instruction.
- Repeated `pending` is idempotent (no duplicate events required).
- No journal. No `SETTLED`. No new instruction / key / provider.

---

## 6. Settled / final

Only canonical outcome **`settled`** may enter the accounting + `SETTLED` path (§14–§18).

Required evidence package:

1. Canonical outcome `settled`
2. Match on identity keys (§9)
3. Amount + currency integrity (§10)
4. Destination/ref integrity when provider exposes it (§10)
5. Durable payout journal for `settlement-payout:{settlementPublicId}`
6. Then operational `SETTLED` + `SettlementSettled`

---

## 7. Failed

- Transition: `SUBMITTED` \| `PROCESSING` → `FAILED` (+ `SettlementFailed` if not already emitted for this failure).
- Merchant payable **remains undischarged** (no payout journal).
- Consumer collection remains `COLLECTED`.
- F2 **does not** create a replacement instruction or enter `RETRY_PENDING` (business recovery deferred).

---

## 8. Not found (critical)

After `ACCEPTED` or `OUTCOME_UNKNOWN` (possible prior send):

`not_found` means **unresolved integrity/ops hold**, not “safe to treat as never sent”.

**Binding:**

- Do **not** resubmit
- Do **not** change idempotency key
- Do **not** switch provider
- Do **not** mark `FAILED` solely from `not_found`
- Do **not** post payout journal
- Do **not** mark `SETTLED`
- Persist hold reason (e.g. `NOT_FOUND`) and keep `reconciliation_required`
- Escalate via financial-integrity / ops signals

---

## 9. Matching keys (binding)

Reconciliation **must** match using strong identifiers (all required where available):

| Key | Source |
| --- | --- |
| Settlement public id | `settlements.public_id` |
| Instruction `business_reference` / provider idempotency key | `settlement-instruction:{settlementPublicId}` |
| `provider_instruction_ref` | When previously stored |
| Instruction `provider` | Original provider code |
| Merchant id | Settlement / instruction tenant |

Optional soft: `merchant_reconciliation_reference` for merchant-facing recon — **not** sufficient alone.

**Forbidden sole matchers:** amount alone, merchant alone, timestamp alone.

---

## 10. Provider result integrity checks

Even with matching ID, canonical `settled`/`failed` results must agree with local authoritative values:

| Check | Local authority | On mismatch |
| --- | --- | --- |
| Amount | `Settlement.amount_minor` (= instruction amount) | Integrity conflict; no `SETTLED` |
| Currency | `Settlement.currency` | Integrity conflict; no `SETTLED` |
| Destination ref | Instruction `provider_destination_ref` snapshot | If provider returns destination and it differs → conflict; no `SETTLED` |
| Provider | Instruction `provider` | Cross-provider result rejected |
| Merchant | Settlement `merchant_id` | Cross-merchant settle forbidden |

---

## 11. Reconciliation trigger model (binding)

**Chosen:** webhook **plus** event-driven lookup (not scheduled poll cadence).

| Trigger | Behaviour |
| --- | --- |
| Verified provider webhook | Maps → `ReconcileSettlement` for the matched instruction |
| `SettlementSubmitted` | settlement-worker **enqueues** `ReconcileSettlement` (at least one lookup path) |
| `OUTCOME_UNKNOWN` / `reconciliation_required` | Same `ReconcileSettlement` / lookup — **no** second submit |
| Operator / test / Fake harness | Explicit `ReconcileSettlement` allowed |
| Automatic ScheduledJob poll every N minutes | **Deferred** — not MVP |

**Polling cadence:** none frozen. Do **not** invent hourly/5-minute jobs. Infrastructure **at-least-once redelivery** of `ReconcileSettlement` for pending/unknown is allowed under [ADR-017](./ADR-017-at-least-once-async-processing.md); that is **not** a new settlement cadence policy.

Local Fake E2E: after `SUBMITTED`, invoke `ReconcileSettlement` (and/or script Fake finality) without requiring a scheduler.

---

## 12. Webhook role and security

- Webhooks are a **first-class** finality channel when **signature-verified** through the SettlementProvider adapter.
- Unverified webhook payloads must not change settlement financial state.
- Fake/local webhook may be test-only.
- Real vendor signature schemes are adapter-specific after OD-009.

---

## 13. FakeSettlementProvider finality

Fake must deterministically support taxonomy outcomes against stable instruction identity (`business_reference` / `provider_instruction_ref`):

- `pending`
- `settled`
- `failed`
- `not_found`
- `unknown`

Rules:

- Same identity → stable scripted outcome (test-configured)
- `reconcile` / `lookup` **must not** increment transfer counters / create new transfers
- `nonProductionOnly` remains enforced
- Production runtime must not fall back to Fake for live money

---

## 14. Payout accounting — economic event

At confirmed payout finality (`settled` + integrity match), Sparelane records:

1. **Discharge** of the merchant payable liability created by the ADR-026 collection journal for this obligation (gross).
2. Recognition of a **settlement-partner clearing** position — **not** Sparelane bank cash, and **not** a reduction of PSP collection `processor-clearing` (settlement partner ≠ PSP; OD-009 separate).

Provider finality proves merchant payout completion through the settlement rail. It does **not** prove Sparelane-owned bank cash movement. Crediting `Bank Cash` is therefore **rejected** for this MVP slice.

### Options considered

| Option | Legs | Verdict |
| --- | --- | --- |
| A | Dr Merchant Payable / Cr Processor clearing | Rejected — conflates PSP collection clearing with settlement partner |
| B | Dr Merchant Payable / Cr Bank Cash | Rejected — overstates cash finality |
| **C** | Dr Merchant Payable / Cr Settlement clearing | **Chosen** |
| D | Two-step clearing→cash before `SETTLED` | Rejected for MVP — bank recon deferred |

---

## 15. Canonical payout journal template (binding)

Exactly two legs. No fee, tax, revenue, wallet, FX, or reserve legs.

| Leg | Side | Account code | Scope | `account_type` | Amount | Currency |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | DEBIT | `mrc:{merchantPublicId}:payable:{currency}` | Merchant | `liability` | `Settlement.amount_minor` | `Settlement.currency` |
| 2 | CREDIT | `sys:settlement-clearing:{settlementProviderCode}:{currency}` | Platform | `clearing` | `Settlement.amount_minor` | `Settlement.currency` |

- `transaction_type` = `settlement_payout`
- Journal currency = Settlement currency; all entry currencies equal journal currency; no FX
- `{settlementProviderCode}` = stable Sparelane provider registry key from **`SettlementInstruction.provider`** (e.g. `fake_settlement`) — not display name; not provider instruction id
- `{merchantPublicId}` / `{currency}` same rules as ADR-026
- Account provisioning: ensure / get-or-create idempotently on posting (unique `code`)

**Processor collection clearing** (`sys:processor-clearing:…`) is **unchanged** by this journal.

**Amount source (authoritative):** `Settlement.amount_minor` + `Settlement.currency` (already = ADR-027 gross payable = Bill gross = F1 transfer amount). Do not trust event payload amounts. Do not invent fee netting.

**Gross / net:** **Gross only** for F2 MVP. No fee legs. Production commercial net payout remains blocked until a later fee/net policy ADR.

---

## 16. Journal business reference (binding)

```text
settlement-payout:{settlementPublicId}
```

where `{settlementPublicId}` is the Settlement opaque public id (`set_…`).

Semantics:

- One successfully finalised Settlement → one logical payout journal
- Redelivered reconciliation / crash replay reuses the same reference
- Do **not** use outbox/event id, poll attempt id, or provider finality ref as the journal idempotency key

Also set `journal_transactions.settlement_id` to the Settlement **internal UUID** (soft ref). Preserve `payment_workflow_id` soft ref when available from the Settlement.

### Traceability (safe)

| Concern | Binding |
| --- | --- |
| Settlement | `business_reference` + `settlement_id` |
| Instruction | Instruction row + `provider_instruction_ref` (not on journal as idempotency key) |
| Merchant | Payable account `merchant_id` + code |
| Settlement provider | Encoded in settlement-clearing account code |
| Finality evidence | Instruction reconcile fields (§19) |
| Forbidden | Raw bank details, PAN/CVV, provider secrets, consumer PII |

---

## 17. Conflicting journal

Same `business_reference` with different substance (amount, currency, accounts, sides) → **financial-integrity conflict**. Do not mark `SETTLED`. Do not mutate the existing journal.

---

## 18. Journal-before-`SETTLED` and split-store (binding)

No XA / 2PC.

```text
1. Establish canonical finality evidence (settled + integrity)
2. Ledger TX: append payout journal (idempotent on business_reference)
3. Verify journal exists with matching substance
4. Operational TX: Settlement → SETTLED (+ settled_at) + SettlementSettled outbox
```

Crash after journal before `SETTLED`: replay → same journal (`already_applied`) → then `SETTLED`.

Crash before journal: Settlement remains `SUBMITTED`/`PROCESSING`; replay reconciles and posts.

**Corrupt state:** `SETTLED` without canonical payout journal → financial-integrity violation (not `already_applied` success).

---

## 19. Evidence provenance / storage (minimal)

No separate giant reconciliation subsystem. Extend `settlement_instructions` with latest reconcile observation:

| Field | Purpose |
| --- | --- |
| `last_reconcile_outcome` | `pending` \| `settled` \| `failed` \| `not_found` \| `unknown` |
| `last_reconcile_source` | `lookup` \| `webhook` |
| `last_reconcile_provider_ref` | Provider finality/status reference when available |
| `last_reconcile_at` | Observed time |
| `reconciliation_hold_reason` | e.g. `NOT_FOUND`, `INTEGRITY_MISMATCH`, `OUTCOME_CONFLICT` (nullable) |

`reconciliation_required` remains until terminal success (`SETTLED` path) or definitive `failed` handling clears the submit-unknown hold as appropriate.

Raw provider payloads are **not** required on the instruction row for MVP.

---

## 20. Commands and events (F2 chain)

```text
SettlementSubmitted
→ ReconcileSettlement
  → (lookup and/or verified webhook evidence)
  → pending: optional SUBMITTED → PROCESSING
  → settled: append settlement-payout journal → SETTLED → SettlementSettled
  → failed: → FAILED → SettlementFailed
  → not_found / unknown: hold; no journal; no SETTLED; no resubmit
```

| Name | Role |
| --- | --- |
| `ReconcileSettlement` | Canonical F2 command (settlement-worker) |
| `LookupSettlementInstruction` | Provider port used **inside** reconcile / unknown recovery — not a second payout |
| `SettlementSettled` | Emitted atomically with `SETTLED` transition (outbox) |
| `SettlementFailed` | On definitive reconcile `failed` (and F1 reject path) |

Do not emit `SettlementCompleted` as a parallel alias; use **`SettlementSettled`**.

Optional detail event `SettlementProcessing` is **not required** if status change is sufficient.

Worker ownership: **settlement-worker** only. No new deployable.

---

## 21. No new external transfer

Reconciliation / lookup / webhook handlers **must not** call `submitSettlementInstruction`.

Static architecture + Fake test: reconcile must not increment Fake transfer counters.

---

## 22. `SETTLED` terminality

`SETTLED` is terminal. Stale submit, accept, pending, unknown, failure, or retry signals must not reopen it.

`CANCELLED` settlements must not be paid/settled via this path (audit/integrity only if encountered).

---

## 23. Financial invariants mapping

| ID | F2 relationship |
| --- | --- |
| [FIN-INV-05](../../requirements/tests/FIN-INV-05.md) | Extends local Fake proof: one instruction → one logical transfer → **one payout journal** → **one SETTLED** under duplicate/concurrent/crash reconcile |
| [FIN-INV-06](../../requirements/tests/FIN-INV-06.md) | Unknown / not_found → no blind resubmit |
| [FIN-INV-03](../../requirements/tests/FIN-INV-03.md) | Payout journal must balance |
| [FIN-INV-08](../../requirements/tests/FIN-INV-08.md) | Merchant isolation on reconcile/`SETTLED` |
| [FIN-INV-09](../../requirements/tests/FIN-INV-09.md) / [FIN-INV-10](../../requirements/tests/FIN-INV-10.md) | Reconcile replay / worker restart → no duplicate journal or SETTLED effect |
| [FIN-INV-02](../../requirements/tests/FIN-INV-02.md) | Collection journal unchanged; separate payout journal |

---

## 24. Real-provider and production-money boundary

| Environment | Rule |
| --- | --- |
| Local / CI Fake | May reconcile Fake finality and post gross payout journal as **financial mechanics proof** |
| Sandbox live rails | Blocked until OD-009 approved provider + adapter |
| Pilot / production money | Blocked until OD-009 **and** fee/net policy (if commercial net payout required) **and** this ADR’s reconcile/`SETTLED` path |

Gross Fake F2 proves mechanics. It does **not** alone clear production commercial settlement.

---

## 25. Schema consequences (platform F2)

- Instruction reconcile observation fields (§19)
- Ensure settlement-clearing accounts; payout journals with `transaction_type=settlement_payout`
- Unique `business_reference` for payout journals
- `settlements.settled_at` set on `SETTLED`
- No `SettlementBatch` requirement
- No raw bank columns

---

## 26. Deferred (explicit)

- OD-009 real settlement partner
- OD-011 batch cadence (still unused)
- Fee / reserve netting and fee CoA legs
- Bank/cash statement reconciliation as `SETTLED` prerequisite
- Automatic ScheduledJob poll cadence
- `RETRY_PENDING` / replacement instruction after FAILED
- Enterprise CoA beyond this payout slice

---

## Consequences

### Positive

- Platform F2 can implement without inventing CoA or finality
- Ack ≠ `SETTLED` remains enforceable
- Unknown/not_found cannot blind-resubmit
- Split-store crash window converges like E1

### Negative / accepted debt

- Bank cash not proven at `SETTLED`
- No automatic long-horizon poll without a later cadence decision
- Production net payout still blocked on fees + OD-009

### Rejected alternatives

1. Mark `SETTLED` on provider `accepted` — rejected (ADR-028)
2. Require bank statement before `SETTLED` in MVP — rejected (overstates custody)
3. Credit Bank Cash on provider finality — rejected
4. Debit/credit processor-clearing on payout — rejected (wrong partner)
5. Invent fee netting in F2 — rejected
6. Auto-resubmit on `not_found` — rejected
7. Freeze every-N-minute poll without evidence — rejected; deferred

---

## Related

- [ADR-026](./ADR-026-collection-ledger-posting-minimal-coa.md)
- [ADR-027](./ADR-027-settlement-obligation-eligibility-cardinality.md)
- [ADR-028](./ADR-028-settlement-execution-payout-destination-instruction-idempotency.md)
- [ledger-model](../money/ledger-model.md)
- [reconciliation](../money/reconciliation.md)
- [settlement-state-machine](../money/settlement-state-machine.md)
- [phase-f2-settlement-finality-decision-gate](../implementation/phase-f2-settlement-finality-decision-gate.md)
