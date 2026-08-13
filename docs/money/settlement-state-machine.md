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

## Settlement record concepts

### Settlement

Merchant-level financial obligation representing funds due for payout after successful consumer collection.

### Settlement Batch

Logical grouping of settlements processed together under configured batching rules.

Batching is a capability, not a mandatory constraint for every banking/settlement partner. Providers that accept individual instructions may skip batch grouping.

### Settlement Instruction

External instruction sent to the banking/settlement partner for one settlement or batch.

The instruction carries provider references/idempotency keys. It is not the financial source of truth; the ledger is.

---

## Settlement states

### PENDING

Settlement intent exists or is being assembled but is not yet confirmed eligible against ledger payable.

**Typical trigger:** PaymentSucceeded / FundsCollected observed.

**Terminal:** No

### ELIGIBLE

Sparelane has determined the funds are eligible for merchant settlement against ledger/payable balances.

**Typical trigger:** Settlement Service verifies payable eligibility.

**Terminal:** No

### BATCHED

Settlement has been grouped into a Settlement Batch where batching applies.

**Typical trigger:** Settlement Batch Service groups eligible items.

**Terminal:** No

### SUBMITTED

Settlement Instruction has been submitted to the banking/settlement partner.

**Typical trigger:** Settlement Instruction Service submit accepted locally.

**Terminal:** No

### PROCESSING

Partner has acknowledged/accepted the instruction for processing, but final settlement is not yet confirmed.

**Typical trigger:** Provider acknowledgement / in-progress status.

**Important:** Acknowledgement alone is not `SETTLED`.

**Terminal:** No

### SETTLED

Settlement has been confirmed through the banking/payment partner and reconciled to the required degree against expected amount and ledger position.

**Typical trigger:** Confirmed provider settlement event + reconciliation match.

**Terminal:** Yes (happy path)

### FAILED

Provider reports failure or reconciliation determines settlement did not complete.

Consumer payment remains `COLLECTED`. Do not reverse consumer collection merely because merchant settlement failed.

**Typical trigger:** Provider failure / definitive negative reconciliation.

**Permitted next:** `RETRY_PENDING` (if bounded retry permitted), or remain failed for operations handling.

**Terminal:** Conditionally (may retry)

### RETRY_PENDING

A later settlement retry is scheduled after a failed or recoverable settlement outcome.

**Typical trigger:** Settlement Service decides bounded retry is permitted.

**Terminal:** No

### CANCELLED

Settlement stopped because the underlying obligation was cancelled/superseded under product rules (rare; rules TBD).

**Terminal:** Yes

---

## Invalid transitions (examples)

- Payment Workflow not `COLLECTED` → Settlement `SUBMITTED`
- `SETTLED` → `SUBMITTED` (without compensating/reversal design; reversals out of Phase 3)
- `FAILED` → `SETTLED` without provider confirmation + reconciliation
- Marking `SETTLED` on first network acknowledgement alone

## Relationship to payment failure

If Payment Workflow is `FAILED`, no settlement eligibility is created and no settlement payout should be instructed.

If Settlement is `FAILED`, the original successful consumer collection remains collected unless a future refund/chargeback design says otherwise (out of Phase 3).
