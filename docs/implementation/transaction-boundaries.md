# Transaction Boundaries

Do **not** use distributed transactions across Operational DB and Ledger DB.

## Bill submission

**One Operational DB transaction:**

1. Enforce API idempotency key
2. Insert Bill (unique merchant + bill ref)
3. Insert Payment Workflow (1:1 bill)
4. Insert Outbox Event (`BillAccepted` / workflow start)

HTTP returns **accepted**, not collected.

## Payment collected

**One Operational DB transaction:**

1. Transition workflow → `COLLECTED` (version check)
2. Update successful attempt → `CAPTURED`
3. Set `ledger_posting_status = PENDING`
4. Insert Outbox Event for collection ledger posting

Ledger write happens later.

## Ledger posting

Split into two independently idempotent transactions (no XA/2PC). Canonical collection substance: [ADR-026](../decisions/ADR-026-collection-ledger-posting-minimal-coa.md).

### Ledger DB transaction

1. Resolve/ensure canonical accounts (processor clearing + merchant payable)
2. Check unique `business_reference` = `payment-collection:{paymentWorkflowPublicId}`
3. Insert Journal Transaction (`transaction_type = collection`)
4. Insert balanced Journal Entries (Dr clearing / Cr payable; Bill `amount_minor`)

### Operational DB confirmation transaction (after journal durable)

1. Verify expected journal exists and substance matches ADR-026
2. Transition `ledger_posting_status` PENDING → **CONFIRMED** (`ConfirmLedgerPosting`)
3. Insert Outbox Event `LedgerPostingConfirmed`

Crash after ledger commit before confirmation: redelivery finds existing journal (`already_applied`) then confirms.
## Settlement creation (F0 — [ADR-027](../decisions/ADR-027-settlement-obligation-eligibility-cardinality.md))

**Operational transaction 1 — create obligation (after ledger confirmed):**

1. Verify workflow `COLLECTED` + `ledger_posting_status = CONFIRMED` + ADR-026 journal (payable CREDIT = Bill amount)
2. Insert Settlement (`PENDING`, unique `payment_workflow_id`, `business_reference = settlement:{paymentWorkflowPublicId}`)
3. Insert Outbox Event `SettlementCreated`

No bank calls. No ledger writes.

**Operational transaction 2 — eligibility (same or later worker pass):**

1. Evaluate merchant status + `APPROVED_FOR_SETTLEMENT` + currency/gates
2. If pass: transition PENDING → ELIGIBLE (OCC/version) + Outbox `SettlementEligible`
3. If fail temporary: leave PENDING (no FAILED)

Idempotent on redelivery of `LedgerPostingConfirmed`: unique `payment_workflow_id` ensures one Settlement.

## Settlement instruction submit

Record instruction + idempotency key before/with provider submit handling; unknown outcomes must not blind-duplicate ([settlement idempotency](../money/settlement-idempotency.md)). Post-F0.
