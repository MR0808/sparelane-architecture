# Payment Workflow & Attempt State Machines

Conceptual state models for Sparelane payment reliability.

These are logical states for architecture and product design. They are not an implementation schema.

## Separation of concerns

Sparelane distinguishes four state lifecycles:

| Lifecycle | Owner of truth | Purpose |
|---|---|---|
| Bill | Merchant (system of record) + Sparelane bill projection | What is owed and when |
| Payment Workflow | Payment State Machine / Orchestrator | Overall collection reliability journey for one bill |
| Payment Attempt | Payment Attempt Service | One concrete try against one method/rail |
| Settlement | Settlement platform (Phase 3) | Merchant payout after successful collection |

`COLLECTED` means consumer funds were successfully collected.

It does **not** mean the merchant has been settled.

---

## Payment Workflow states

A Payment Workflow is created when a merchant bill is accepted into Sparelane and remains active until collection succeeds, the workflow fails terminally, or it is cancelled.

### CREATED

**Meaning:** Bill accepted; payment workflow exists but no schedule action has started.

**Typical trigger:** Successful bill ingestion / `BillAccepted`.

**Permitted next:** `SCHEDULED`, `CANCELLED`

**Terminal:** No

### SCHEDULED

**Meaning:** Workflow is waiting for a scheduled action such as early pre-auth or due-date payment.

**Typical trigger:** Bill Scheduler plans next action / `BillActionDue` planned.

**Permitted next:** `PREAUTH_PENDING`, `PAYMENT_PENDING`, `CANCELLED`

**Terminal:** No

### PREAUTH_PENDING

**Meaning:** An early payment-method validation attempt is in flight.

**Typical trigger:** Orchestrator starts pre-authorisation where supported.

**Permitted next:** `PREAUTHORISED`, `RETRY_PENDING`, `ACTION_REQUIRED`, `PAYMENT_PENDING`, `FAILED`, `CANCELLED`

**Terminal:** No

### PREAUTHORISED

**Meaning:** Early validation succeeded for the selected method. Funds are not yet collected for the bill.

**Typical trigger:** Provider authorisation success for pre-auth attempt.

**Permitted next:** `PAYMENT_PENDING`, `CANCELLED`

**Terminal:** No

### PAYMENT_PENDING

**Meaning:** A collection attempt is in flight (authorise/capture or wallet debit).

**Typical trigger:** Orchestrator initiates a payment attempt.

**Permitted next:** `COLLECTED`, `RETRY_PENDING`, `ACTION_REQUIRED`, `FAILED`, `CANCELLED`

**Terminal:** No

### RETRY_PENDING

**Meaning:** No immediate eligible fallback remains (or product rules defer action); a future retry is scheduled.

**Typical trigger:** Soft/retryable failure + Retry Service schedule accepted.

**Permitted next:** `PAYMENT_PENDING`, `ACTION_REQUIRED`, `FAILED`, `CANCELLED`

**Terminal:** No

### ACTION_REQUIRED

**Meaning:** Consumer or merchant intervention is needed before Sparelane can usefully continue (for example update card, fund wallet, or manually retry).

**Typical trigger:** Hard method failure with remaining recovery window, or policy requiring consumer action.

**Permitted next:** `PAYMENT_PENDING`, `RETRY_PENDING`, `FAILED`, `CANCELLED`

**Terminal:** No

### COLLECTED

**Meaning:** Consumer funds for this bill have been successfully collected. Ledger posting is then confirmed asynchronously (outbox); settlement eligibility requires posting confirmation (not COLLECTED alone).

**Typical trigger:** Successful capture / wallet collection recorded against a Payment Attempt.

**Permitted next:** none for payment workflow (settlement proceeds on a separate lifecycle)

**Terminal:** Yes (for payment reliability workflow)

### FAILED

**Meaning:** All eligible methods and permitted retries are exhausted within the recovery window. Sparelane stops attempting collection and returns control to the merchant's normal collection process.

**Typical trigger:** Orchestrator determines irrecoverable failure.

**Permitted next:** none

**Terminal:** Yes

### CANCELLED

**Meaning:** Workflow stopped because the bill was cancelled, superseded, or otherwise no longer payable through Sparelane.

**Typical trigger:** Merchant cancellation / superseding bill event (exact product rules TBD).

**Permitted next:** none

**Terminal:** Yes

---

## Invalid workflow transitions (examples)

These transitions must be rejected by the Payment State Machine:

- `FAILED` → `COLLECTED`
- `CANCELLED` → `PAYMENT_PENDING`
- `CREATED` → `COLLECTED` (no successful attempt)
- `COLLECTED` → `PAYMENT_PENDING`
- `COLLECTED` → `FAILED`
- Any transition that implies settlement succeeded without `COLLECTED`

Pre-authorisation success must not jump directly to `COLLECTED`.

---

## Payment Attempt states

A Payment Workflow can have **multiple Payment Attempts**.

```text
1 Payment Workflow
→ 1..N Payment Attempts
```

Each attempt is an immutable historical record for one method/rail execution. Retries and fallbacks create **new** attempts; they do not rewrite a failed attempt into success.

### CREATED

Attempt record created before provider submission.

### SUBMITTED

Request sent to card adapter / wallet / future rail.

### AUTHORISED

Provider authorised funds or validated the method (including successful pre-auth). Not necessarily final collection for the bill.

### DECLINED

Provider declined the attempt. Classification (soft/hard/technical/unknown) is recorded separately.

### ERROR

Technical/provider/transport failure prevented a definitive payment outcome.

### CANCELLED

Attempt voided or abandoned before completion (for example superseded workflow cancellation).

### CAPTURED

Funds successfully collected for this attempt. For collection workflows, this is the attempt-level success that supports workflow `COLLECTED`.

### Notes

- Not every attempt passes through every state.
- A pre-auth may end in `AUTHORISED` without `CAPTURED`.
- A capture-only flow may move `CREATED` → `SUBMITTED` → `CAPTURED` or `DECLINED`.
- Wallet attempts may omit card-specific authorisation semantics but still use attempt status for auditability.

---

## Relationship to settlement

When the payment workflow reaches `COLLECTED`:

1. Operational transaction commits `COLLECTED` + outbox atomically.
2. Idempotent ledger posting confirms the financial journal.
3. Settlement becomes **eligible** only after ledger posting confirmation.

Settlement state is designed in Phase 3 and remains separate.
