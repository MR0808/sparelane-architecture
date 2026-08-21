---
id: ADR-028
title: Settlement Execution, Payout Destination and Instruction Idempotency Policy
status: Accepted
date: 2026-08-21
deciders: Architecture
consulted: Money / Settlement / Merchants / Security
informed: Platform engineering
supersedes: []
related:
  - ADR-006
  - ADR-017
  - ADR-026
  - ADR-027
  - OD-009
  - OD-011
  - OD-015
---

# ADR-028 — Settlement Execution, Payout Destination and Instruction Idempotency Policy

## Status

**Accepted**

Unblocks platform **F1** (settlement instruction + FakeSettlementProvider execution semantics) without inventing batch cadence, real banking partner, settlement CoA, or SETTLED/reconciliation.

## Context

[ADR-027](./ADR-027-settlement-obligation-eligibility-cardinality.md) freezes:

- one confirmed collection → one Settlement
- amount = ADR-026 merchant payable CREDIT (gross)
- PENDING → ELIGIBLE eligibility
- ELIGIBLE ≠ submitted / SETTLED
- settlement-worker ownership
- FAILED recoverable; ineligibility ≠ FAILED
- no blind retry on unknown external outcome (stated, not executed)

Platform F1 correctly stopped because architecture had not frozen:

1. payout destination model
2. batch grouping
3. batch cadence
4. instruction cardinality
5. instruction amount
6. external idempotency key
7. provider-neutral request/result taxonomy
8. pre-submit safety gates
9. exact state transitions on accepted / failure / unknown
10. explicit F1 boundary before reconciliation / SETTLED

This ADR freezes the **MVP execution model** so F1 can implement:

```text
ELIGIBLE Settlement
→ payout destination resolution
→ SettlementInstruction
→ provider-neutral submission
→ provider result persistence
→ non-reconciled settlement state
```

without guessing.

## Decision summary (binding)

| # | Decision |
| --- | --- |
| 1 | **No execution batching in MVP F1** (Option A) |
| 2 | `SettlementBatch` deferred; OD-011 cadence remains open for **future** production aggregation only |
| 3 | **1 Settlement → at most 1 active SettlementInstruction**; retries reuse the same instruction |
| 4 | Instruction amount = Settlement amount (gross); currency = Settlement currency; no FX |
| 5 | Payout destination = merchant-owned **provider token/reference**; no raw bank details on instruction |
| 6 | Destination owned by **Merchants** module (`merchant_payout_destinations`) |
| 7 | Submit requires destination **ACTIVE + verified**; merchant LIVE (or sandbox-ready locally) + `APPROVED_FOR_SETTLEMENT` rechecked |
| 8 | Selection = **one default destination per merchant + currency** |
| 9 | External idempotency key = instruction `business_reference` = `settlement-instruction:{settlementPublicId}` |
| 10 | Provider outcomes: `accepted` \| `rejected` \| `technical_error` \| `unknown_outcome` |
| 11 | `accepted` → Settlement **SUBMITTED** (not SETTLED); F1 happy-path **ends at SUBMITTED** |
| 12 | `unknown_outcome` → Settlement **SUBMITTED** + instruction `OUTCOME_UNKNOWN` + reconcile hold; **no** resubmit / new key / alternate provider |
| 13 | F1 uses **FakeSettlementProvider only** for local proof; production fail-closed without approved real provider ([OD-009](./open/OD-009-settlement-partner.md)) |
| 14 | F1 **does not** post settlement CoA journals; Fake/local execution is non-production money |
| 15 | SETTLED / reconciliation / settlement journals = **F2+** |

---

## 1. MVP batching decision — Option A

### Options compared

| Option | Model | Verdict |
| --- | --- | --- |
| **A** | 1 Settlement → 1 SettlementInstruction → 1 provider submission; no batch | **Chosen for MVP** |
| B | ELIGIBLE Settlements → SettlementBatch → instruction(s) | Rejected for MVP — grouping/window/cadence unresolved |
| C | Batch object exists but always one Settlement per batch | Rejected — indirection without payout efficiency |

### Binding

- **SettlementBatch is not used in MVP F1**
- OD-011 cadence **does not block F1**
- SettlementBatch remains deferred for **production-scale payout aggregation**
- One Settlement creates **at most one** active SettlementInstruction
- **No cron/cadence** is required to submit a single ELIGIBLE obligation
- FSM transition for F1 happy path: **ELIGIBLE → SUBMITTED** (skip BATCHED)
- BATCHED remains in the enum for future use; F1 must not require it

This **narrows** OD-011; it does **not** fully resolve future batching policy.

---

## 2. Payout destination economic model

A **MerchantPayoutDestination** is a merchant-owned, externally usable **token/reference** representing a verified bank/settlement destination at a provider.

It is **not**:

- a ledger account
- raw BSB / account / routing material stored on Settlement or SettlementInstruction
- authority merely by possessing a public id (ownership check required)

### Minimum conceptual fields

| Field | Rule |
| --- | --- |
| `id` / `public_id` (`mpd_…`) | Stable public identity |
| `merchant_id` | Owner; immutable |
| `provider` | Provider key (e.g. `fake` locally) |
| `provider_destination_ref` | Opaque token/reference (e.g. `dest_test_…` for Fake) |
| `currency` | Single ISO currency this destination pays in |
| `status` | See §4 |
| `verified_at` | Non-null when verified |
| `is_default` | Default flag within merchant + currency |
| `created_at` / `updated_at` | Audit |

Optional non-sensitive display labels only (e.g. masked last-4 from provider) — never full account numbers in MVP architecture.

---

## 3. Destination ownership and persistence

| Concern | Binding |
| --- | --- |
| Owner module | **Merchants** (not Settlement) |
| Table | `merchant_payout_destinations` |
| Settlement usage | Resolve by merchant + currency default; store **FK / public id snapshot** on instruction |
| Cross-merchant | Settlement.merchant_id **must equal** destination.merchant_id — else **financial-integrity failure** |

Settlement must not own merchant identity/bank data merely for convenience.

---

## 4. Raw bank-data policy

**MVP architecture does not store** raw bank account / BSB / routing details on SettlementInstruction or in the settlement domain.

Tokenisation / hosted onboarding (when a real provider exists) supplies `provider_destination_ref`. If raw details are ever required, a **separate** encryption/classification/access ADR is mandatory — out of F1 scope.

Fake/local destinations use non-sensitive deterministic refs (`dest_test_…`).

---

## 5. Destination status

```text
UNVERIFIED
ACTIVE
INACTIVE
REVOKED
```

| Status | Submit-eligible? |
| --- | --- |
| UNVERIFIED | **No** |
| ACTIVE | **Yes**, only if `verified_at` is set |
| INACTIVE | **No** |
| REVOKED | **No** |

---

## 6. Destination verification

**Required before provider submission:** destination must be ACTIVE and verified (`verified_at` not null).

Verification may be provider-owned via a capability/port (`verifyPayoutDestination` or onboard result). F1 Fake may mark destinations verified deterministically. Do **not** select a real bank vendor here ([OD-009](./open/OD-009-settlement-partner.md)).

---

## 7. Destination selection (MVP)

**Binding rule:** resolve the merchant’s **single default** `MerchantPayoutDestination` for `(merchant_id, currency)` where `is_default = true` and status submit-eligible.

- Do **not** “pick first created”
- Do **not** rely on DB ordering
- Do **not** select by arbitrary “any available”

### Uniqueness

**At most one default** destination per `(merchant_id, currency)` — platform must enforce (partial unique index / equivalent).

Multiple non-default ACTIVE destinations may exist for future product; MVP execution **ignores** non-defaults.

If no default / not verified / wrong currency → **pre-submit gate failure** (§16); do not invent FAILED.

---

## 8. Instruction cardinality

```text
1 Settlement → at most 1 active SettlementInstruction
```

- Schema: `settlement_instructions.settlement_id` **NOT NULL UNIQUE** (MVP path; no `settlement_batch_id` on F1 instructions)
- Technical retries **reuse the same** instruction row and same external idempotency key
- Do **not** create a new instruction on infrastructure retry
- Superseding instruction (new row) is **out of F1** — only if a future ADR allows after permanent invalidation + economically different destination/amount

---

## 9. Instruction amount and currency

| Field | Source |
| --- | --- |
| `amount_minor` | `Settlement.amount_minor` (immutable gross) |
| `currency` | `Settlement.currency` |

Destination currency must match Settlement currency. **No FX. No fee/netting mutation** in F1.

### Gross instruction policy

F1 external instruction sends the **same gross** amount as ADR-027 Settlement.

**Production implication:** real-world net merchant payout remains blocked until fee/reserve CoA/policy exists. Fake/local gross transfer proves **execution mechanics only**, not production payout economics.

---

## 10. Business identities

| Entity | Identity |
| --- | --- |
| Settlement | `settlement:{paymentWorkflowPublicId}` (ADR-027) |
| SettlementInstruction | `business_reference` UNIQUE = `settlement-instruction:{settlementPublicId}` |
| Public id | `sinstr_…` (platform-generated; not the provider key) |

Do **not** use event IDs as instruction identity.

---

## 11. Provider idempotency key

**Exact external idempotency key** passed to the provider:

```text
SettlementInstruction.business_reference
= settlement-instruction:{settlementPublicId}
```

Properties:

- stable across technical retries and process restart
- never reused for a different instruction
- safe to pass to provider (not a secret)
- deterministic for replay

---

## 12. Provider-neutral port

```text
submitSettlementInstruction({
  idempotencyKey,          // business_reference above
  destinationReference,    // provider_destination_ref
  amountMinor,
  currency,
  reconciliationReference, // merchant_reconciliation_reference or settlement public id
  settlementPublicId       // correlation only; not a second money key
})
```

```text
lookupSettlementInstruction({
  idempotencyKey?,
  providerInstructionRef?
})
```

No vendor-specific fields on the port. Capabilities may advertise lookup/idempotency/webhooks.

---

## 13. Provider result taxonomy

| Outcome | Meaning |
| --- | --- |
| `accepted` | Provider accepted/created the transfer **instruction**. Not funds received; not SETTLED |
| `rejected` | Provider **explicitly** rejected the instruction (business/known decline) |
| `technical_error` | Known **no-send** transport/infra failure (safe to retry same key within bounds) |
| `unknown_outcome` | Request **may** have been accepted; local result indeterminate |

Do **not** conflate technical_error with unknown_outcome. Do **not** treat provider `settled` signals in F1 as Sparelane SETTLED (map to evidence for F2+ reconciliation only).

---

## 14. Accepted semantics and Settlement state

`accepted` ⇒ provider holds the instruction.

| Must not mean | |
| --- | --- |
| Merchant received funds | |
| Bank settlement complete | |
| Reconciliation complete | |
| Sparelane SETTLED | |

**Binding transition:** ELIGIBLE → **SUBMITTED** (persist `provider_instruction_ref`, `submitted_at`).

### PROCESSING

- Provider acceptance yields **SUBMITTED**
- Later definitive async “in progress” (lookup/webhook) may yield SUBMITTED → **PROCESSING**
- F1 Fake may demonstrate lookup → PROCESSING **without** SETTLED
- F1 happy-path **terminal-for-this-slice** state = **SUBMITTED**

---

## 15. Known rejection, technical failure, unknown

### Known rejection (`rejected`)

- Settlement → **FAILED**
- Instruction status → `REJECTED`
- Obligation **preserved** (row not deleted)
- May later → RETRY_PENDING under bounded policy (**business retry = F2+**; F1 need not auto-recover)

### Technical error (`technical_error`)

- Known no-send
- Settlement **remains ELIGIBLE** (or stays in pre-accept claim)
- Same instruction + same idempotency key
- Bounded infrastructure retry
- Exhausted → Settlement **FAILED** then **RETRY_PENDING** if FSM permits; still **same** instruction identity for later retry

### Unknown outcome (`unknown_outcome`) — critical

Must:

- **not** create another instruction
- **not** change provider idempotency key
- **not** submit to an alternate provider
- **not** mark FAILED merely to enable retry
- **not** mark SETTLED
- **require** lookup / reconciliation hold

**Binding representation (no new SettlementStatus):**

- Settlement → **SUBMITTED**
- Instruction status → `OUTCOME_UNKNOWN`
- Set durable `reconciliation_required` / hold flag on instruction (or equivalent)
- Worker path: **lookup only** until provider truth known

Do **not** hide unknown as FAILED (FAILED can cause resubmission paths).

---

## 16. SettlementInstruction status (MVP)

Settlement FSM alone is insufficient for unknown execution identity. Instruction carries execution outcome:

```text
CREATED
ACCEPTED
REJECTED
TECHNICAL_ERROR
OUTCOME_UNKNOWN
```

Lifecycle:

1. TX A: create `CREATED` (+ outbox `SettlementInstructionCreated`) while Settlement still ELIGIBLE
2. Provider call **outside** TX
3. TX B: persist outcome + Settlement transition/outbox

---

## 17. Pre-submit revalidation

Immediately before external call, re-check:

| Gate | Block if |
| --- | --- |
| Merchant status | SUSPENDED / OFFBOARDED / DRAFT / PENDING_VERIFICATION (LIVE or SANDBOX_READY-in-sandbox required) |
| KYB | `APPROVED_FOR_SETTLEMENT` false/revoked |
| Destination | missing default, not ACTIVE, not verified, currency mismatch, wrong merchant |
| Settlement | not ELIGIBLE; instruction already ACCEPTED / OUTCOME_UNKNOWN / REJECTED as terminal-for-submit |

### Pre-submit gate failure

- **Do not erase** obligation
- **Do not** transition to FAILED (not an external execution failure per ADR-027)
- Remain **ELIGIBLE** with durable blocked reason / hold for ops
- Do not call provider

ADR-027 ELIGIBLE is **not** eternally valid for submit.

---

## 18. Network / transaction topology

**D3 pattern — mandatory:**

```text
TX A: create/prepare instruction + OCC/state guard + outbox
commit
provider call (no open DB TX)
TX B: persist provider result + Settlement transition + outbox
```

No open DB transaction across the network.

---

## 19. Duplicate and concurrent execution

Layered protection **required**:

1. Unique `settlement_id` on instruction (one active instruction)
2. Unique instruction `business_reference` / idempotency key
3. Settlement state guard + OCC (only ELIGIBLE may start submit; only legal transitions)
4. ProcessedEvent / outbox consumer idempotency
5. Provider idempotency key on submit

Queue claim alone is **insufficient**.

**Concurrent workers:** prefer state/claim guard to minimise duplicate provider calls; if both call, **same idempotency key** must yield **one** logical transfer. Economic result: one payout instruction.

---

## 20. Crash after provider accepted

Require:

- same instruction
- same idempotency key
- provider lookup / replay
- adopt same external transfer reference

**No second transfer.**

---

## 21. SETTLED / reconciliation / F1 end state

| Rule | Binding |
| --- | --- |
| Provider accepted / SUBMITTED / PROCESSING | **≠** SETTLED |
| SETTLED | Only after reconciliation evidence (F2+) |
| F1 happy-path end | **SUBMITTED** then **STOP** |
| Handoff event | `SettlementSubmitted` (consumable by later reconciliation) |
| Batch events | **Do not** emit `BatchCreated` / batch chain in F1 |

---

## 22. Commands and events (F1 chain)

```text
SettlementEligible
→ CreateSettlementInstruction
→ SettlementInstructionCreated
→ ExecuteSettlementInstruction
→ (provider)
→ SettlementSubmitted   // on accepted
   or SettlementFailed  // on rejected / exhausted technical
   or hold via instruction OUTCOME_UNKNOWN (SettlementSubmitted + reconcile hold)
```

Optional: `SettlementInstructionAccepted` as alias detail event is **not** required if `SettlementSubmitted` carries instruction refs.

Worker ownership: **settlement-worker** only (instruction create, execute, persist result). Not payment-worker.

---

## 23. Settlement accounting boundary

**F1 does not create** a settlement execution journal.

Payout CoA (Dr merchant payable / Cr cash or clearing, etc.) remains **open**.

| Environment | Rule |
| --- | --- |
| Local / CI Fake | May submit Fake transfer **without** settlement journal as **execution proof only** |
| Sandbox live rails | Blocked until OD-009 + payout CoA policy |
| Pilot / production money | Blocked until payout CoA **and** reconciliation (SETTLED path) **and** approved provider |

Do not invent fee legs in F1.

---

## 24. Fake provider and production readiness

- F1 implements **FakeSettlementProvider** validating port semantics, idempotency, unknown/lookup
- OD-009 **remains open** for real partner selection
- Production must **fail closed** without configured approved provider — **no** silent Fake fallback for live money
- Fake destination refs: `dest_test_…` (non-sensitive)

---

## 25. Financial invariants

| Invariant | F1 relationship |
| --- | --- |
| [FIN-INV-04](../../requirements/tests/FIN-INV-04.md) | Regression: instruction layer must not create a second Settlement; still 1:1 obligation |
| [FIN-INV-05](../../requirements/tests/FIN-INV-05.md) | F1 proves **locally**: one instruction → one logical Fake transfer under duplicate/concurrent/crash replay — **not** real-bank exactly-once |
| [FIN-INV-06](../../requirements/tests/FIN-INV-06.md) | Unknown → no blind resubmit; lookup/hold |
| [FIN-INV-08](../../requirements/tests/FIN-INV-08.md) | Isolation extends to destination, instruction, and provider request merchant scope |

---

## 26. Schema consequences (platform F1)

1. `merchant_payout_destinations` as above + unique default `(merchant_id, currency)` where `is_default`
2. `settlement_instructions`:
   - `settlement_id` NOT NULL UNIQUE
   - `settlement_batch_id` NULL / unused in F1
   - `business_reference` UNIQUE
   - `idempotency_key` UNIQUE (= business_reference) **or** store once and treat as synonym
   - `amount_minor`, `currency`, destination FK/ref, `status`, `provider`, `provider_instruction_ref`, `reconciliation_required`, timestamps
3. `settlement_batches` table may remain for future; **not** on F1 path
4. Settlements: no batch membership required for submit

---

## Consequences

### Positive

- F1 implementable without batch/cadence/partner/CoA guesses
- Exactly-once instruction story aligns with ADR-027 1:1 obligation
- Unknown outcome cannot silently double-pay via FAILED retry
- Clear Fake vs production money boundary

### Negative / tradeoffs

- One provider transfer per collection until batching ships
- Gross Fake payout ≠ production net economics
- BATCHED unused in MVP may confuse readers — documented as deferred

### Must not

- Use SettlementBatch in F1
- Store raw bank credentials on instructions
- Mark SETTLED on provider ack
- Create second instruction on technical retry
- Blind resubmit after unknown
- Fall back to Fake in production live money
- Post invented settlement CoA in F1
- Cross-merchant destination payout

## Alternatives considered

1. **MVP batching (Option B)** — rejected; OD-011 unresolved; complicates amount/idempotency
2. **One Settlement per empty batch (Option C)** — rejected; worthless indirection
3. **Raw bank details on instruction** — rejected for MVP; token/ref preferred
4. **ELIGIBLE → PROCESSING directly** — rejected; SUBMITTED is the F1 acceptance state; PROCESSING is async follow-on
5. **Unknown as FAILED** — rejected; enables unsafe retry semantics
6. **Require settlement CoA before Fake F1** — rejected; would block local execution proof; CoA still blocks **production** money
7. **Select real OD-009 partner in this ADR** — rejected; Fake validates semantics only

## Dependencies / open questions

| Item | Status after this ADR |
| --- | --- |
| OD-011 batch cadence | **Narrowed** — F1 does not batch; future production aggregation schedule still open |
| OD-009 settlement partner | **Open** — Fake only in F1 |
| Settlement / payout CoA | **Open** — blocks production money, not local Fake F1 |
| Fee/reserve netting | **Open** — production blocker |
| OD-015 KYB evidence retention | **Open** |
| Business retry / superseding instruction | **Deferred to F2+** |
| Full reconciliation → SETTLED | **F2+** |

## Related

- [ADR-027](./ADR-027-settlement-obligation-eligibility-cardinality.md)
- [settlement-state-machine](../money/settlement-state-machine.md)
- [settlement-idempotency](../money/settlement-idempotency.md)
- [SEQ-MONEY-002](../design/money/merchant-settlement.md)
- [SEQ-MONEY-005](../design/money/unknown-settlement-outcome.md)
- [phase-f1-settlement-execution-decision-gate](../implementation/phase-f1-settlement-execution-decision-gate.md)
