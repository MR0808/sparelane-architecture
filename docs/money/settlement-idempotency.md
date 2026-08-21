# Settlement Idempotency

Financial payouts must tolerate retries, timeouts and delayed provider events without paying merchants twice.

Binding obligation identity: [ADR-027](../decisions/ADR-027-settlement-obligation-eligibility-cardinality.md).

Binding instruction execution: [ADR-028](../decisions/ADR-028-settlement-execution-payout-destination-instruction-idempotency.md).

## 1. Settlement creation

A Payment Workflow that reaches `COLLECTED` with `ledger_posting_status = CONFIRMED` must not generate duplicate merchant settlement obligations.

Binding protections:

- stable settlement identity: `business_reference = settlement:{paymentWorkflowPublicId}`
- DB uniqueness: `settlements.payment_workflow_id` UNIQUE
- Settlement create is idempotent for redelivered `LedgerPostingConfirmed`
- F0 proves **one Settlement domain obligation**; it does **not** prove one bank transfer

Do not settle from aggregate merchant payable balance alone.

## 2. Settlement instruction

Network retries must not accidentally send duplicate merchant payments ([FIN-INV-05](../../requirements/tests/FIN-INV-05.md)).

Binding protections ([ADR-028](../decisions/ADR-028-settlement-execution-payout-destination-instruction-idempotency.md)):

- at most one active `SettlementInstruction` per Settlement (`settlement_id` UNIQUE)
- instruction `business_reference` = `settlement-instruction:{settlementPublicId}` UNIQUE
- external provider idempotency key = that `business_reference`
- technical retries reuse the **same** instruction and key — never a new instruction
- Settlement OCC/state guard + ProcessedEvent + provider key (queue claim insufficient)
- local state machine prevents uncontrolled resubmit while instruction is `ACCEPTED` / `OUTCOME_UNKNOWN` or Settlement is `SUBMITTED` / `PROCESSING` pending reconcile

## 3. Provider response

Repeated or delayed provider events must be safely repeatable.

Conceptual protections:

- deduplicate by provider event/settlement reference
- apply settlement transitions only if legal for current settlement state
- ignore stale events that cannot change state (for example duplicate `SETTLED`)
- provider `accepted` → SUBMITTED only; never SETTLED on ack alone

## 4. Reconciliation

Repeated reconciliation jobs/events must not create duplicate financial movements (F2+).

Conceptual protections:

- reconciliation results are idempotent per settlement + provider statement reference
- compensating entries are explicitly keyed and not re-posted blindly
- matched settlements are not re-opened by identical inputs

## Unknown external outcome

Example:

1. Sparelane submits settlement instruction.
2. Network times out.
3. Sparelane does not know whether the partner accepted it.

Architecture must ([ADR-028](../decisions/ADR-028-settlement-execution-payout-destination-instruction-idempotency.md)):

```text
Settlement → SUBMITTED
instruction → OUTCOME_UNKNOWN + reconciliation_required
→ lookupSettlementInstruction (same idempotency key)
→ determine actual external state
→ continue, confirm, or retry safely
```

Do **not**:

- create another instruction
- change the provider idempotency key
- submit to an alternate provider
- mark FAILED merely to retry
- mark SETTLED

This flow is modelled in:

```text
08 Flows / Money Movement / Unknown Settlement Outcome
```

## Related docs

- [Settlement state machine](settlement-state-machine.md)
- [Reconciliation](reconciliation.md)
- [ADR-006 Separate settlement lifecycle](../decisions/ADR-006-separate-settlement-lifecycle.md)
- [ADR-027 Settlement obligation / eligibility](../decisions/ADR-027-settlement-obligation-eligibility-cardinality.md)
- [ADR-028 Settlement execution / instruction](../decisions/ADR-028-settlement-execution-payout-destination-instruction-idempotency.md)
