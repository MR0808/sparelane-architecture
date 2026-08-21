# Settlement State Machine

Conceptual settlement lifecycle for Sparelane.

Payment Workflow state and Settlement state are separate.

```text
Payment Workflow = COLLECTED
```

does **not** imply:

```text
Settlement = SETTLED
```

Binding MVP obligation and eligibility policy: [ADR-027](../decisions/ADR-027-settlement-obligation-eligibility-cardinality.md).

## Settlement record concepts

### Settlement

**MVP binding:** discharge of the specific merchant payable obligation created by **one** confirmed PaymentWorkflow collection (ADR-026 Cr merchant payable).

Cardinality: **1 CONFIRMED collection workflow → 1 Settlement** (`payment_workflow_id` UNIQUE).

Amount: gross merchant payable CREDIT from the collection journal (must equal Bill `amount_minor`). Not derived aggregate account balance. Not net of fees (fees deferred).

Business reference: `settlement:{paymentWorkflowPublicId}`.

### Settlement Batch

Optional **future** execution grouping of ELIGIBLE settlements (merchant + currency + window). Not a mandatory parent. **Not created in F0 or F1.** Cadence remains [OD-011](../decisions/open/OD-011-settlement-batching.md). MVP F1 uses **no batching** ([ADR-028](../decisions/ADR-028-settlement-execution-payout-destination-instruction-idempotency.md)).

### Settlement Instruction

External instruction to the banking/settlement partner. Not financial SoT (ledger is). **F1:** at most one active instruction per Settlement; amount = Settlement gross; provider key = `settlement-instruction:{settlementPublicId}` ([ADR-028](../decisions/ADR-028-settlement-execution-payout-destination-instruction-idempotency.md)).

### Merchant payout destination

Merchant-owned provider token/reference (`merchant_payout_destinations`). Default per merchant+currency; ACTIVE+verified required before submit. Raw bank details not stored on instructions.

---

## Settlement states

### PENDING

Confirmed merchant payable obligation is recorded as a Settlement, but eligibility conditions are not yet satisfied.

**Typical trigger:** `LedgerPostingConfirmed` → CreateSettlement.

**Does not mean:** bank transfer pending.

**Terminal:** No

### ELIGIBLE

Domain eligibility passed (ledger confirmed, journal valid, merchant status, KYB/`APPROVED_FOR_SETTLEMENT`, currency, no duplicate). Ready for instruction — **not** submitted. F1 rechecks merchant/KYB/destination immediately before provider call.

**Typical trigger:** Settlement eligibility evaluation succeeds (PENDING→ELIGIBLE).

**Terminal:** No

### BATCHED

Settlement grouped into a Settlement Batch where **future** batching applies. **Not used in F1.**

**Typical trigger:** Settlement Batch Service groups eligible items (post-F1).

**Terminal:** No

### SUBMITTED

Settlement Instruction accepted by the partner **or** submit outcome unknown and held for lookup ([ADR-028](../decisions/ADR-028-settlement-execution-payout-destination-instruction-idempotency.md)). **F1 happy-path end state.** Not SETTLED.

**Typical trigger:** Provider `accepted` or `unknown_outcome` after ExecuteSettlementInstruction.

**Terminal:** No

### PROCESSING

Partner async in-progress after SUBMITTED; final settlement not confirmed. Optional F1 Fake lookup; SETTLED still requires reconciliation (F2+).

**Typical trigger:** Lookup/webhook indicates processing.

**Important:** Acknowledgement alone is not `SETTLED`.

**Terminal:** No

### SETTLED

Confirmed through the banking/payment partner **and** reconciled to the required degree against expected amount and ledger position.

**Typical trigger:** Confirmed provider settlement event + reconciliation match.

**Terminal:** Yes (happy path)

### FAILED

Provider reports failure or reconciliation determines settlement did not complete (**external execution** path).

**Not used for:** merchant temporarily SUSPENDED, KYB blocked, or missing/invalid payout destination — those remain PENDING (eligibility) or ELIGIBLE with execution hold ([ADR-028](../decisions/ADR-028-settlement-execution-payout-destination-instruction-idempotency.md)).

Consumer payment remains `COLLECTED`. Do not reverse consumer collection merely because merchant settlement failed.

**Typical trigger:** Provider failure / definitive negative reconciliation.

**Permitted next:** `RETRY_PENDING` (if bounded retry permitted), or remain failed for operations handling.

**Terminal:** No (recoverable via RETRY_PENDING when permitted)

### RETRY_PENDING

A later settlement retry is scheduled after a failed or recoverable **external** settlement outcome.

**Typical trigger:** Settlement Service decides bounded retry is permitted.

**Terminal:** No

### CANCELLED

Settlement stopped because the underlying obligation was cancelled/superseded under product rules.

**F0:** state retained in FSM; product cancel command deferred (no inventing cancel flows).

**Terminal:** Yes

---

## Invalid transitions (examples)

- Payment Workflow not `COLLECTED` / ledger not `CONFIRMED` → Settlement `SUBMITTED`
- `SETTLED` → `SUBMITTED` (without compensating/reversal design; reversals out of Phase 3)
- `FAILED` → `SETTLED` without provider confirmation + reconciliation
- Marking `SETTLED` on first network acknowledgement alone
- Merchant ineligibility → automatic `FAILED` / delete Settlement

## Relationship to payment failure

If Payment Workflow is `FAILED`, no Settlement is created and no settlement payout should be instructed.

If Settlement is `FAILED`, the original successful consumer collection remains collected unless a future refund/chargeback design says otherwise (out of Phase 3).
