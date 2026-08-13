# Settlement Idempotency

Financial payouts must tolerate retries, timeouts and delayed provider events without paying merchants twice.

## 1. Settlement creation

A Payment Workflow that reaches `COLLECTED` must not generate duplicate merchant settlement obligations.

Conceptual protections:

- stable settlement identity keyed to payment workflow / bill / merchant reference
- Settlement Service create is idempotent for the same source event
- ledger payable consumption is guarded so the same obligation cannot be settled twice

## 2. Settlement instruction

Network retries must not accidentally send duplicate merchant payments.

Conceptual protections:

- provider idempotency key / instruction reference on Settlement Instruction
- local state machine prevents uncontrolled resubmit while `SUBMITTED` / `PROCESSING`
- instruction service records provider references before assuming success

## 3. Provider response

Repeated or delayed provider events must be safely repeatable.

Conceptual protections:

- deduplicate by provider event/settlement reference
- apply settlement transitions only if legal for current settlement state
- ignore stale events that cannot change state (for example duplicate `SETTLED`)

## 4. Reconciliation

Repeated reconciliation jobs/events must not create duplicate financial movements.

Conceptual protections:

- reconciliation results are idempotent per settlement + provider statement reference
- compensating entries are explicitly keyed and not re-posted blindly
- matched settlements are not re-opened by identical inputs

## Unknown external outcome

Example:

1. Sparelane submits settlement instruction.
2. Network times out.
3. Sparelane does not know whether the partner accepted it.

Architecture must:

```text
query / reconcile with provider
→ determine actual external state
→ continue, confirm, or retry safely
```

Do **not** blindly submit another payout instruction while outcome is unknown.

This flow is modelled in:

```text
08 Flows / Money Movement / Unknown Settlement Outcome
```

## Related docs

- [Settlement state machine](settlement-state-machine.md)
- [Reconciliation](reconciliation.md)
- [ADR-006 Separate settlement lifecycle](../decisions/ADR-006-separate-settlement-lifecycle.md)
