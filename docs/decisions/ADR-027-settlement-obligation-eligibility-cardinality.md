# ADR-027 — Settlement Obligation, Eligibility and Cardinality Policy

## Status

Accepted

## Context

Phase E ends with:

```text
PaymentWorkflow COLLECTED
→ ADR-026 collection journal
→ ledgerPostingStatus CONFIRMED
→ LedgerPostingConfirmed
```

Accepted ADRs already freeze settlement **mechanics**:

- collection before settlement; ledger confirmation before eligibility ([ADR-005](./ADR-005-collection-before-settlement.md), [ADR-016](./ADR-016-operational-ledger-consistency.md), [ADR-026](./ADR-026-collection-ledger-posting-minimal-coa.md))
- separate settlement lifecycle ([ADR-006](./ADR-006-separate-settlement-lifecycle.md))
- status matrix PENDING → … → SETTLED / CANCELLED ([settlement-state-machine](../money/settlement-state-machine.md))
- settlement-worker ownership; batch/instruction concepts exist as schema/docs

They do **not** freeze settlement **substance** required for platform F0:

1. what economic obligation a Settlement represents
2. amount source
3. one-workflow vs aggregate cardinality
4. merchant / KYB eligibility
5. fees / reserves treatment
6. creation vs eligibility semantics

Platform correctly stopped F0 until this gate. This ADR freezes the MVP obligation and eligibility policy so F0 can implement without inventing financial policy.

It does **not** select a settlement/banking partner ([OD-009](./open/OD-009-settlement-partner.md)), freeze batch cadence ([OD-011](./open/OD-011-settlement-batching.md)), invent settlement CoA legs, or require external payout in F0.

## Decision

### 1. Economic obligation

**A Settlement represents discharge of the specific merchant payable obligation created by one confirmed PaymentWorkflow collection.**

That payable is the ADR-026 collection journal credit:

```text
Cr mrc:{merchantPublicId}:payable:{currency}
amount = Bill.amount_minor
business_reference = payment-collection:{paymentWorkflowPublicId}
```

Settlement does **not** represent:

- an arbitrary positive derived merchant payable **account balance**
- an aggregate of multiple collections
- a bank transfer
- a fee/net payout schedule

### 2. Cardinality (binding MVP)

**OPTION A — 1 confirmed collection workflow → 1 Settlement**

| Rule | Binding |
| --- | --- |
| Source | Exactly one `PaymentWorkflow` with `ledger_posting_status = CONFIRMED` and durable ADR-026 journal |
| Settlement rows | At most one Settlement per that workflow |
| Aggregation | **Not** on Settlement; later optional `SettlementBatch` groups ELIGIBLE settlements for external execution |
| Membership model | Not required for MVP |

**Rejected for MVP:**

- **OPTION B** (many workflows → one Settlement) — needs cutoff, membership, grouping key, and more complex idempotency before F0 can proceed.
- **OPTION C** (explicit Payable Obligation entity + Settlement aggregate) — unnecessary domain layer; Settlement **is** the per-collection obligation record; batching later covers aggregation.

### 3. Amount source

Authoritative settlement amount:

1. Load canonical collection journal by `business_reference = payment-collection:{paymentWorkflowPublicId}`
2. Read the **merchant payable CREDIT** entry amount/currency on that journal
3. Assert it equals Bill `amount_minor` / `currency` and workflow merchant
4. On mismatch → **financial integrity failure**; do **not** create Settlement

Do **not** settle from:

- event payload amounts alone
- derived aggregate merchant payable balance alone
- provider settlement amounts
- net-of-fee guesses

### 4. Gross vs net; fees / reserves

MVP Settlement amount is **gross** merchant payable from ADR-026.

| Item | F0 reduces settlement amount? |
| --- | --- |
| PSP fees | **NO / deferred** |
| Sparelane fees | **NO / deferred** |
| Reserves | **NO / deferred** |
| Withholding | **NO / deferred** |
| Refunds | **NO / deferred** (future compensating journals / separate process) |
| Chargebacks | **NO / deferred** |
| Adjustments | **NO / deferred** |

**Production blocker (documented):** real-world net merchant payout cannot be production-ready until a later CoA/policy ADR defines fee/reserve netting. Local/fake F0 may still prove obligation + eligibility mechanics on gross amounts.

Fee/reserve recognition, if any, must use **separate** journals/processes later — not mutate Settlement `amount_minor` after create.

### 5. Ledger confirmation precondition

Settlement creation requires **all** of:

- `PaymentWorkflow.status = COLLECTED`
- `ledger_posting_status = CONFIRMED`
- durable ADR-026 collection journal exists and validates

`COLLECTED` alone is insufficient.

### 6. Business identity and uniqueness

| Field | Rule |
| --- | --- |
| Stable business reference | `settlement:{paymentWorkflowPublicId}` (unique) |
| Public id | Opaque `set_…` per [ADR-020](./ADR-020-opaque-public-identifiers.md) / relational model |
| DB uniqueness | `settlements.payment_workflow_id` **UNIQUE** (canonical one-settlement invariant) |
| Event id | Must **not** be settlement identity |

Duplicate `LedgerPostingConfirmed` / concurrent workers → same Settlement (insert conflict or load existing). `ProcessedEvent` is not the sole correctness mechanism.

### 7. Creation vs eligibility lifecycle

**OPTION A (binding):**

```text
LedgerPostingConfirmed
→ CreateSettlement → Settlement(status=PENDING) + SettlementCreated
→ evaluate eligibility
→ if satisfied: PENDING → ELIGIBLE + SettlementEligible
→ else: remain PENDING (retry evaluation later)
```

Do **not** create directly as ELIGIBLE. Obligation existence is separated from payout eligibility.

### 8. PENDING / ELIGIBLE semantics

**PENDING** means: a confirmed merchant payable obligation exists as a Settlement record, but eligibility conditions are not yet satisfied (or not yet re-evaluated successfully). It does **not** mean bank transfer pending / instruction submitted.

**ELIGIBLE** means all of:

- collection ledger posting CONFIRMED and journal valid
- Settlement amount/currency/merchant match journal obligation
- merchant status permits settlement (table below)
- KYB / settlement capability approved
- currency supported (ISO; no FX)
- no duplicate Settlement for the workflow
- Settlement not CANCELLED / blocked by terminal product rule

ELIGIBLE does **not** mean: instruction sent, batch created, provider accepted, or SETTLED.

### 9. Merchant status eligibility

| MerchantStatus | Settlement eligibility |
| --- | --- |
| `DRAFT` | **Ineligible** |
| `PENDING_VERIFICATION` | **Ineligible** |
| `SANDBOX_READY` | **Eligible only in sandbox/local contexts**; not for production live payout |
| `LIVE` | **Eligible** (status gate only; KYB still required) |
| `SUSPENDED` | **Ineligible** — Settlement remains PENDING; do not FAILED/CANCELLED |
| `OFFBOARDED` | **Ineligible** — Settlement remains PENDING / operator review; **do not** delete or auto-cancel the payable obligation |

Merchant ineligibility must **not** erase the ADR-026 payable journal or the Settlement obligation row.

### 10. KYB / APPROVED_FOR_SETTLEMENT

Settlement eligibility requires a **separate** verification/capability gate, not MerchantStatus alone.

Binding capability name: **`APPROVED_FOR_SETTLEMENT`**

Semantics:

- true only when business verification (KYB) is approved for settlement payout
- false/unknown → remain PENDING; do not FAILED/CANCELLED solely for KYB reject/pending
- KYB rejected/failed → remain PENDING / blocked; liability preserved; operator path later

**Local / test:** FakeBusinessVerificationProvider (or equivalent) may deterministically grant `APPROVED_FOR_SETTLEMENT`.

**Production / live payout:** fail closed without approved verification. Vendor selection remains open ([OD-015](./open/OD-015-kyb-evidence-retention.md) evidence retention still open).

Platform consequence if no persistence exists yet: store a merchant-scoped verification/capability state (or port result) readable by settlement-worker; do not infer approval from `LIVE` alone.

### 11. Payout destination

**ELIGIBLE does not require** a validated payout destination.

Payout destination is checked later before instruction submit (`SUBMITTED` path / F1). Binding destination model: [ADR-028](./ADR-028-settlement-execution-payout-destination-instruction-idempotency.md). Missing destination must not invent eligibility failure as terminal FAILED in F0.

### 12. Currency

- One Settlement = one currency = collection journal currency
- No FX
- Multi-currency merchant → separate Settlements per collection currency
- Later batches must not mix currencies unless a future ADR explicitly allows it

### 13. Amount immutability

After Settlement create: `amount_minor`, `currency`, `merchant_id`, `payment_workflow_id`, business reference are **immutable**. Future adjustments use separate accounting/process, not silent mutation.

### 14. State machine (existing enum preserved)

Statuses remain:

```text
PENDING → ELIGIBLE → (BATCHED optional) → SUBMITTED → PROCESSING → SETTLED
FAILED / RETRY_PENDING for external execution paths
CANCELLED terminal
```

| State | Business meaning (F0 focus) | Terminal? |
| --- | --- | --- |
| PENDING | Obligation recorded; eligibility not satisfied | No |
| ELIGIBLE | Domain-ready for later batch/instruction | No |
| BATCHED | Grouped for execution (not F0) | No |
| SUBMITTED | Instruction submitted to partner (not F0) | No |
| PROCESSING | Partner in progress; not SETTLED (not F0) | No |
| SETTLED | Confirmed **and** reconciled; not ack alone | **Yes** (happy) |
| FAILED | External execution / definitive negative recon failure — **not** merchant temporary ineligibility | **No** — may → RETRY_PENDING if bounded retry allowed |
| RETRY_PENDING | Bounded external retry scheduled | No |
| CANCELLED | Obligation cancelled/superseded under product rules | **Yes** |

**FAILED vs ineligibility:** merchant SUSPENDED / KYB blocked / missing destination → remain **PENDING** (or later hold), **not** FAILED.

**CANCELLED:** FSM retains the state; F0 has **no** product cancel command unless/until a later ADR defines triggers (e.g. collection reversal). Do not invent cancel flows in F0.

**SETTLED:** requires reconciliation/confirmation evidence. Provider acceptance / SUBMITTED / PROCESSING is insufficient.

### 15. Batch and instruction boundaries

| Concept | F0 |
| --- | --- |
| SettlementBatch | **Optional execution grouping**; **not** created in F0; no cadence policy required for F0 ([OD-011](./open/OD-011-settlement-batching.md) remains open) |
| SettlementInstruction | **External transfer execution**; **not** created/sent in F0 |
| Settlement provider | Provider-neutral; [OD-009](./open/OD-009-settlement-partner.md) remains open |
| Settlement CoA journal | **Not** posted in F0 |

### 16. Eligibility outcome table

| Ledger CONFIRMED + journal valid? | Merchant status | KYB / APPROVED_FOR_SETTLEMENT | Existing Settlement? | Currency OK? | Outcome |
| --- | --- | --- | --- | --- | --- |
| No | * | * | No | * | Do not create; recover posting / INTEGRITY_ERROR if claimed confirmed without journal |
| Yes (amount mismatch) | * | * | No | * | INTEGRITY_ERROR — do not create |
| Yes | * | * | Yes (same workflow) | * | ALREADY_EXISTS — idempotent load; re-evaluate eligibility if still PENDING |
| Yes | LIVE (or SANDBOX_READY in sandbox) | Approved | No | Yes | CREATE_PENDING then → ELIGIBLE |
| Yes | LIVE / SANDBOX_READY | Not approved | No | Yes | CREATE_PENDING; REMAIN_PENDING |
| Yes | SUSPENDED / OFFBOARDED / DRAFT / PENDING_VERIFICATION | * | No | Yes | CREATE_PENDING; REMAIN_PENDING |
| Yes | LIVE | Approved | No | No / unsupported | CREATE_PENDING; REMAIN_PENDING or INTEGRITY_ERROR if journal currency invalid |

### 17. Events and ownership

| Step | Owner | Transaction | Events |
| --- | --- | --- | --- |
| Create obligation | settlement-worker on `LedgerPostingConfirmed` | Settlement row + outbox | `SettlementCreated` |
| Eligibility pass | settlement-worker | status PENDING→ELIGIBLE + outbox | `SettlementEligible` |

No bank/provider calls in F0. No ledger mutation in F0 settlement path.

Command catalogue: `CreateSettlement`, `EvaluateSettlementEligibility` (or equivalent internal command names).

### 18. Schema consequences (platform F0)

Minimum:

- `settlements.payment_workflow_id` **NOT NULL** + **UNIQUE**
- `business_reference` (or equivalent) UNIQUE = `settlement:{paymentWorkflowPublicId}`
- immutable amount/currency/merchant/workflow fields
- status + version/OCC for transitions
- readable merchant KYB / `APPROVED_FOR_SETTLEMENT` capability (port or persisted state)

Optional: `eligibility_blocked_reason` for ops (non-authoritative).

Current absence of unique `payment_workflow_id` is a **schema gap**; F0 must migrate uniqueness — not application-only.

### 19. Financial invariants

| Invariant | F0 relationship |
| --- | --- |
| [FIN-INV-04](../../requirements/tests/FIN-INV-04.md) | Failed/non-collected workflows create no Settlement; CONFIRMED collection path only |
| One settlement per confirmed collection | Enabled by unique `payment_workflow_id` (extends FIN-INV-04 family for success path) |
| [FIN-INV-05](../../requirements/tests/FIN-INV-05.md) | **Not** proven in F0 — concerns instruction submission identity (F1+) |
| [FIN-INV-08](../../requirements/tests/FIN-INV-08.md) | F0 must enforce merchant_id isolation on Settlement create/eligibility; full payout isolation completes with instruction phase |

F0 proves **one Settlement domain obligation**. It does **not** prove **one bank transfer** (instruction/provider idempotency later).

### 20. Deferred (explicitly open)

- OD-009 settlement partner
- OD-011 batch schedule/cadence (further narrowed by ADR-028: no MVP batching)
- Settlement CoA (Dr payable / Cr cash or clearing) at execution time
- Fee/reserve/net payout policy
- Product CANCELLED triggers
- Refund/chargeback interaction with open Settlements

Payout destination MVP persistence/selection/verification: **resolved in ADR-028** (vendor onboarding mechanics may remain open with OD-009).

## Consequences

### Positive

- F0 implementable without guessing amount/cardinality/eligibility
- Exact collection → settlement traceability
- Payable survives temporary merchant/KYB blocks
- Batching remains optional and does not reshape Settlement into an aggregate

### Negative / tradeoffs

- Many Settlement rows if execution were 1:1 without batching later
- Gross settlement is not production net-payout ready (documented blocker)
- KYB capability persistence may need a small platform schema/port addition

### Must not

- Settle unconfirmed collections
- Create duplicate Settlements for one workflow
- Cross-merchant or cross-currency mix on one Settlement
- Settle aggregate account balance
- Erase payable on ineligibility
- Call bank/provider or create instructions in F0
- Treat ELIGIBLE as SETTLED or provider ack as reconciliation

## Alternatives Considered

1. **Aggregate Settlement (many workflows → one)** — rejected for MVP; undefined cutoff/membership.
2. **Separate Payable Obligation entity** — rejected; Settlement is the obligation; batch aggregates later.
3. **Create directly ELIGIBLE** — rejected; loses PENDING hold semantics for blocked merchants.
4. **Net of fees in F0** — rejected; invents fee policy ADR-026 explicitly deferred.
5. **Settle from derived balance** — rejected; loses per-collection identity and FIN safety.
6. **KYB deferred / omit gate** — rejected for production intent; local fake + fail-closed production is the binding split.
7. **Require payout destination for ELIGIBLE** — deferred to pre-submit; destination model/vendor still open.

## Dependencies / Open Questions

- [OD-009](./open/OD-009-settlement-partner.md) partner — open
- [OD-011](./open/OD-011-settlement-batching.md) cadence — open (batching **role** decided: optional later grouping)
- [OD-015](./open/OD-015-kyb-evidence-retention.md) evidence retention — open
- Fee/reserve CoA — open (production net payout blocker)
- Settlement execution accounting — open (not F0)

## Related Architecture

- LikeC4: `merchantSettlement`
- Docs: [settlement-state-machine](../money/settlement-state-machine.md), [ledger-model](../money/ledger-model.md), [SEQ-MONEY-002](../design/money/merchant-settlement.md)
- Schema: [relational-model](../schema/relational-model.md) settlements; [enums](../schema/enums.md) SettlementStatus
- Supersedes: none (narrows TBDs; does not supersede ADR-005/006/026)
