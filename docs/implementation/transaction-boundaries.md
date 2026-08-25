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

## Settlement instruction submit (F1 — [ADR-028](../decisions/ADR-028-settlement-execution-payout-destination-instruction-idempotency.md))

**No open DB TX across provider network.**

### Operational TX A — prepare

1. Recheck merchant status + `APPROVED_FOR_SETTLEMENT` + default destination (ACTIVE+verified, same merchant+currency)
2. Insert SettlementInstruction (`CREATED`, unique `settlement_id`, `business_reference = settlement-instruction:{settlementPublicId}`)
3. OCC/state guard on Settlement still ELIGIBLE
4. Outbox `SettlementInstructionCreated`

### Provider call (outside TX)

`submitSettlementInstruction` with idempotency key = instruction `business_reference`.

### Operational TX B — result

| Outcome | Persist |
| --- | --- |
| `accepted` | Instruction ACCEPTED + provider ref; Settlement ELIGIBLE→SUBMITTED; Outbox `SettlementSubmitted` |
| `rejected` | Instruction REJECTED; Settlement → FAILED; Outbox `SettlementFailed` |
| `technical_error` | Instruction TECHNICAL_ERROR; Settlement remains ELIGIBLE; bounded same-key retry |
| `unknown_outcome` | Instruction OUTCOME_UNKNOWN + `reconciliation_required`; Settlement → SUBMITTED; no second instruction |

Unknown recovery uses `lookupSettlementInstruction` / `ReconcileSettlement` with the **same** key — never a new instruction. F1 does not post settlement CoA journals and does not mark SETTLED.

## F2 — ReconcileSettlement / SETTLED ([ADR-029](../decisions/ADR-029-settlement-finality-reconciliation-payout-accounting.md))

No distributed TX between ledger and operational Settlement store.

### Ledger TX (when outcome = `settled`)

Append payout journal `settlement-payout:{settlementPublicId}` (Dr payable / Cr settlement-clearing); idempotent on `business_reference`.

### Operational TX (after journal verified)

Settlement SUBMITTED|PROCESSING → SETTLED + `settled_at` + Outbox `SettlementSettled`.

## Compensating ledger correction (ADR-036)

**No distributed TX with PSP/settlement providers** (none are called). Prefer a single Ledger DB transaction that also records PrivilegedActionRequest execution + audit when those stores share the same DB; otherwise:

### Ledger (+ privileged request) TX

1. Validate PrivilegedActionRequest `approved` + fingerprint + MFA context
2. `SELECT … FOR UPDATE` source journal; recompute remaining capacity
3. Append compensating journal (`transaction_type = correction`, `business_reference = ledger-correction:{parPublicId}`, `corrects_journal_transaction_id`)
4. Mark PrivilegedActionRequest `executed`; append durable audit

Failed validation → no journal write; original history unchanged. Redelivery of same `par_…` → `already_applied`.

### Operational settlement gates (separate TXs)

Create/execute settlement instruction MUST recompute `remaining = collectionAmount − Σ linked corrections` and refuse when remaining ≤ 0 or amount would exceed remaining — **without** rewriting historical Settlement rows as a side effect of correction.

### Other outcomes (operational only)

| Outcome | Persist |
| --- | --- |
| `pending` | Optional SUBMITTED→PROCESSING; instruction reconcile fields; no journal |
| `failed` | → FAILED + `SettlementFailed`; no payout journal |
| `not_found` / `unknown` | Hold + `reconciliation_hold_reason`; no resubmit; no SETTLED |

Reconcile/lookup must not call submit. Crash after journal before SETTLED: replay → same journal → then SETTLED.

## Merchant webhook projection and delivery ([ADR-030](../decisions/ADR-030-merchant-webhook-contract-signing-and-delivery.md))

**No open DB TX across merchant HTTP.**

### Operational TX A — project

1. Load authoritative aggregate; derive merchant from DB (not event payload)
2. If type not in closed catalogue: no-op
3. Insert WebhookEvent idempotently on `(merchant_id, type, source_identity)`
4. Insert WebhookDelivery rows for currently ACTIVE subscribed endpoints

### HTTP (outside TX)

Sign exact body bytes; POST with SSRF controls.

### Operational TX B — attempt result

Append WebhookDeliveryAttempt; update logical delivery; schedule next delay or FAILED/CANCELLED.

Webhook/notification processing must not write Bill, PaymentWorkflow, PaymentAttempt, Ledger, Settlement, or SettlementInstruction.
