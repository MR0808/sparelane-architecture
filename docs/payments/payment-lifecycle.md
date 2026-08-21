# Payment Lifecycle

Conceptual end-to-end lifecycle for Sparelane payment reliability, stopping at successful collection / settlement eligibility.

Sparelane does not guarantee payment. If recovery is terminally exhausted within the recovery window, the merchant is notified and resumes normal collection.

Binding recovery policy: [ADR-024](../decisions/ADR-024-payment-recovery-ordering-and-exhaustion.md).
Binding retry timings / cutoff / Retry Now: [ADR-025](../decisions/ADR-025-payment-retry-timing-budget-and-recovery-window.md).

## Lifecycle overview

```text
Bill received
→ Bill validated (idempotent)
→ Payment workflow created / scheduled
→ Early / pre-auth check (where supported)
→ Method selection
→ Payment attempt
→ Provider response
→ Decline Classification (normalised classes)
→ Orchestrator recovery decision (ADR-024)
→ Backup attempt and/or RETRY_PENDING and/or ACTION_REQUIRED
→ Successful collection (COLLECTED)
→ Ledger update
→ Settlement eligibility
```

or

```text
... automatic recovery exhausted (window still open)
→ ACTION_REQUIRED (consumer may remediate)
```

or

```text
... recovery window / cutoff exhausted (or other terminal trigger)
→ Payment workflow FAILED
→ Consumer notification
→ Merchant webhook
→ Merchant resumes collection
```

No settlement event is emitted on terminal payment failure.

## Stages

### 1. Bill received

Merchant Billing System remains source of truth. Merchant Integration Backend submits the bill event to the Merchant API.

### 2. Bill validated

Bill Validation checks ownership, consumer connection and idempotency. Duplicate submissions must not create duplicate workflows.

### 3. Workflow created / scheduled

Bill Service persists the Sparelane bill projection and associated Payment Workflow (`CREATED` / `SCHEDULED`). `BillAccepted` is published.

### 4. Early / pre-auth check

Bill Scheduler may trigger the Payment Orchestrator before due date. Reliability Engine selects the first eligible method. Pre-authorisation Service coordinates provider validation where supported.

Pre-authorisation success ≠ collection.

### 5. Method selection

Reliability Engine applies deterministic MVP rules using Payment Method Priority Service data, prior attempt outcomes, and Orchestrator-supplied exclusions.

See [payment-method-selection.md](payment-method-selection.md).

### 6. Payment attempt

Orchestrator creates a new Payment Attempt and invokes Card Adapter or Wallet Payment Service. Attempt history is immutable.

### 7. Provider response

PSP webhooks (or synchronous responses) enter via Webhook Ingress, become internal events, and are applied idempotently by the Orchestrator.

Decline Classification normalises soft/hard/technical/unknown outcomes. Classification may be attached write-once after the attempt is already `DECLINED` / `ERROR` ([ADR-024](../decisions/ADR-024-payment-recovery-ordering-and-exhaustion.md)).

### 8. Orchestrator recovery decision

Payment Orchestrator (not Decline Classification, not Retry Service) applies [ADR-024](../decisions/ADR-024-payment-recovery-ordering-and-exhaustion.md):

```text
decline / error / unknown / captured
→ classify if needed
→ decide: COLLECTED | try backup | RETRY_PENDING | ACTION_REQUIRED | FAILED | reconcile
```

### 9. Fallback

If immediate fallback is permitted (`RETRYABLE` or `NON_RETRYABLE` with an eligible backup), Reliability Engine selects the next eligible method and Orchestrator creates another attempt. Soft-declined methods are skipped in the immediate walk so backups are tried first.

### 10. Scheduled retry

If retryable (or technical known no-charge) and no useful immediate fallback remains (or policy forbids backup-for-technical), and retry budget remains: workflow → `RETRY_PENDING`.

```text
RETRY_PENDING
→ Retry Service persists ScheduledJob (PaymentRetryDue) per ADR-025 delays
→ PaymentRetryDue fires
→ Orchestrator reloads state → PAYMENT_PENDING
→ new same-method PaymentAttempt
→ ExecutePaymentAttempt command (PSP remains D3)
```

See [retry-policy.md](retry-policy.md) and [ADR-025](../decisions/ADR-025-payment-retry-timing-budget-and-recovery-window.md).

### 11. Consumer intervention

When automatic recovery cannot continue but remediation is possible: workflow → `ACTION_REQUIRED`. Consumer can update methods and/or use **Retry Now** (ADR-025: consumes next permitted ordinal; cancels pending ScheduledJob; no extra budget). Manual retry is still subject to state validation and idempotency. UNKNOWN/reconciliation pending blocks Retry Now.

### 12. Successful collection

On capture/wallet success:

- attempt → `CAPTURED`
- workflow → `COLLECTED`
- ledger records collected funds (Phase E)
- `PaymentCollected` (canonical) / curated merchant webhook as applicable
- settlement becomes eligible after ledger posting confirmed

### 13. Final payment failure

When `now >= cutoffAt` (dueDate + 7 days @ 09:00 frozen TZ) **and** ADR-025 guards clear (no UNKNOWN pending; no in-flight attempt):

```text
RETRY_PENDING | ACTION_REQUIRED | idle PAYMENT_PENDING
→ FAILED
→ PaymentFailed (once)
→ notify consumer / merchant
→ no settlement eligibility
```

Cutoff does **not** terminalize while UNKNOWN reconciliation is pending or an attempt is in flight.
## References

- [Payment state machine](payment-state-machine.md)
- [Payment method selection](payment-method-selection.md)
- [Retry policy](retry-policy.md)
- [Idempotency](idempotency.md)
- [ADR-001 PSP tokenisation](../decisions/ADR-001-psp-tokenisation.md)
- [ADR-002 Payment Orchestrator](../decisions/ADR-002-payment-orchestrator.md)
- [ADR-003 Workflow vs Attempt](../decisions/ADR-003-payment-workflow-vs-attempt.md)
- [ADR-024 Recovery ordering and exhaustion](../decisions/ADR-024-payment-recovery-ordering-and-exhaustion.md)

## Out of scope here

- Settlement batching and banking rails (Phase 3)
- Refunds, chargebacks and disputes (future design)
