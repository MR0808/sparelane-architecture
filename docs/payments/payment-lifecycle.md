# Payment Lifecycle

Conceptual end-to-end lifecycle for Sparelane payment reliability, stopping at successful collection / settlement eligibility.

Sparelane does not guarantee payment. If all eligible methods and retries fail, the merchant is notified and resumes normal collection.

## Lifecycle overview

```text
Bill received
→ Bill validated (idempotent)
→ Payment workflow created / scheduled
→ Early / pre-auth check (where supported)
→ Method selection
→ Payment attempt
→ Provider response
→ Fallback and/or scheduled retry as permitted
→ Consumer intervention when required
→ Successful collection (COLLECTED)
→ Ledger update
→ Settlement eligibility
```

or

```text
... recovery exhausted
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

Reliability Engine applies deterministic MVP rules using Payment Method Priority Service data and prior attempt outcomes.

See [payment-method-selection.md](payment-method-selection.md).

### 6. Payment attempt

Orchestrator creates a new Payment Attempt and invokes Card Adapter or Wallet Payment Service. Attempt history is immutable.

### 7. Provider response

PSP webhooks (or synchronous responses) enter via Webhook Ingress, become internal events, and are applied idempotently by the Orchestrator.

Decline Classification normalises soft/hard/technical/unknown outcomes.

### 8. Fallback

If immediate fallback is permitted, Reliability Engine selects the next eligible method and Orchestrator creates another attempt.

### 9. Scheduled retry

If retryable and no useful immediate fallback remains, Retry Service schedules a later `PaymentRetryDue`. Orchestrator later creates a **new** attempt.

See [retry-policy.md](retry-policy.md).

### 10. Consumer intervention

Workflow may enter `ACTION_REQUIRED`. Consumer can update methods and/or use Retry Now. Manual retry is still subject to state validation and idempotency.

### 11. Successful collection

On capture/wallet success:

- attempt → `CAPTURED`
- workflow → `COLLECTED`
- ledger records collected funds
- `PaymentSucceeded` (or equivalent) is emitted
- settlement becomes eligible

### 12. Final payment failure

When methods and retries are exhausted:

- workflow → `FAILED`
- notify consumer as required
- notify merchant
- no settlement eligibility

## References

- [Payment state machine](payment-state-machine.md)
- [Payment method selection](payment-method-selection.md)
- [Retry policy](retry-policy.md)
- [Idempotency](idempotency.md)
- [ADR-001 PSP tokenisation](../decisions/ADR-001-psp-tokenisation.md)
- [ADR-002 Payment Orchestrator](../decisions/ADR-002-payment-orchestrator.md)
- [ADR-003 Workflow vs Attempt](../decisions/ADR-003-payment-workflow-vs-attempt.md)

## Out of scope here

- Settlement batching and banking rails (Phase 3)
- Refunds, chargebacks and disputes (future design)
