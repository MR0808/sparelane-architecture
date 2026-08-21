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

**Meaning:** No useful immediate fallback remains under [ADR-024](../decisions/ADR-024-payment-recovery-ordering-and-exhaustion.md); a future same-method retry is intended. D4 may enter this state; D5 schedules the due time per [ADR-025](../decisions/ADR-025-payment-retry-timing-budget-and-recovery-window.md) (max 3; delays 6h/24h/48h).

**Typical trigger:** `RETRYABLE` with no eligible backup and retry budget remaining; or `TECHNICAL_ERROR` (known no-charge) with retry budget remaining.

**Permitted next:** `PAYMENT_PENDING`, `ACTION_REQUIRED`, `FAILED`, `CANCELLED`

**Terminal:** No

### ACTION_REQUIRED

**Meaning:** Automatic recovery cannot usefully continue **now**, but consumer or merchant intervention could restore recoverability within the recovery window (for example update card, add method, fund wallet, or Retry Now).

**Typical trigger:** No eligible backup after `NON_RETRYABLE`; or retry budget exhausted after soft/technical paths; automatic recovery exhausted while the recovery window remains open ([ADR-024](../decisions/ADR-024-payment-recovery-ordering-and-exhaustion.md)).

**Permitted next:** `PAYMENT_PENDING`, `RETRY_PENDING`, `FAILED`, `CANCELLED`

**Terminal:** No

### COLLECTED

**Meaning:** Consumer funds for this bill have been successfully collected. Ledger posting is then confirmed asynchronously (outbox); settlement eligibility requires posting confirmation (not COLLECTED alone).

**Typical trigger:** Successful capture / wallet collection recorded against a Payment Attempt; Orchestrator applies collect transition.

**Permitted next:** none for payment workflow (settlement proceeds on a separate lifecycle)

**Terminal:** Yes (for payment reliability workflow)

### FAILED

**Meaning:** Terminal. No further automatic **or expected consumer** recovery under MVP policy for this workflow (typically recovery window / due-date cutoff exhausted, merchant cancellation, or other explicit unrecoverable condition). Sparelane returns control to the merchant's normal collection process.

**Typical trigger:** Cutoff / window processor or Orchestrator determines terminal failure per [ADR-024](../decisions/ADR-024-payment-recovery-ordering-and-exhaustion.md) and [ADR-025](../decisions/ADR-025-payment-retry-timing-budget-and-recovery-window.md) (`now >= cutoffAt`, UNKNOWN/in-flight guards clear). **Not** triggered solely by exhausting the immediate backup walk while the window remains open (that is `ACTION_REQUIRED`).

Legal entry from cutoff (when guards clear): `RETRY_PENDING` → `FAILED`, `ACTION_REQUIRED` → `FAILED`, and idle `PAYMENT_PENDING` → `FAILED`.

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

Provider declined the attempt. Classification (`RETRYABLE` / `NON_RETRYABLE` / …) is recorded on the attempt (may be attached write-once after the decline transition — [ADR-024](../decisions/ADR-024-payment-recovery-ordering-and-exhaustion.md)).

### ERROR

Technical/provider/transport failure with a **known no-charge** outcome (distinct from UNKNOWN / ambiguous timeout). Classification `TECHNICAL_ERROR` is recorded separately / write-once as needed.

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
