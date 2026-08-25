# ADR-026 — Collection Ledger Posting and Minimal Chart of Accounts

## Status

Accepted

## Context

Sparelane Phase E must post a journal when a Payment Workflow reaches `COLLECTED` and emits `PaymentCollected` ([ADR-016](./ADR-016-operational-ledger-consistency.md)).

Accepted ADRs already freeze **mechanics**:

- double-entry, balanced, append-only journals ([ADR-004](./ADR-004-double-entry-ledger.md))
- collection before settlement ([ADR-005](./ADR-005-collection-before-settlement.md))
- operational vs ledger separation; no distributed TX ([ADR-013](./ADR-013-ledger-operational-separation.md), [ADR-016](./ADR-016-operational-ledger-consistency.md))
- at-least-once delivery with idempotent consumers ([ADR-017](./ADR-017-at-least-once-async-processing.md))
- integer minor units + ISO currency ([ADR-021](./ADR-021-money-representation.md))

They do **not** freeze the **accounting substance** for a successful collection. `docs/money/ledger-model.md` previously labelled the collection legs as illustrative and left exact CoA/legs TBD with accounting advice. Platform implementation correctly refused to invent a template.

This ADR freezes the **minimum MVP Chart of Accounts slice** required to implement:

`PaymentCollected` → one balanced collection `JournalTransaction`

It does **not** freeze the final enterprise CoA (settlement, fees, refunds, chargebacks, wallet, tax, FX, reconciliation adjustments remain later decisions).

## Decision

### 1. Economic event represented by `PaymentCollected`

At `PaymentWorkflow.status = COLLECTED` with durable `PaymentCollected`, Sparelane knows:

1. A provider-backed collection attempt reached a verified success outcome (`CAPTURED` or equivalent) for this workflow.
2. Sparelane has a **processor/acquirer clearing claim** (receivable/clearing asset) for the **gross** collected amount in the bill currency — **not** confirmation that cash has settled into Sparelane’s bank account.
3. Sparelane has a **merchant payable liability** for that same gross amount — **payable eligibility**, not cash sent, settled, or available-to-withdraw.

This ADR covers **provider/card (and equivalent PSP) collection** into merchant payable. Wallet funding/spend templates are out of scope.

### 2. Canonical collection journal template (binding)

Exactly two legs. No fee, tax, revenue, wallet, settlement, or reserve legs.

| Leg | Side | Account purpose | Scope | `account_type` | Amount | Currency |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | DEBIT | Processor collection clearing | Platform; one account per **provider code + currency** | `clearing` | Bill `amount_minor` | Bill `currency` |
| 2 | CREDIT | Merchant payable | Merchant; one account per **merchant + currency** | `liability` | Bill `amount_minor` | Bill `currency` |

`transaction_type` on the journal header: `collection`.

Journal currency: Bill `currency`. All entry currencies equal journal currency. No FX. No mixed-currency journals.

### 3. Gross vs net; fees

Post the **gross** Bill obligation amount.

- Amount source (authoritative): **Bill** `amount_minor` + `currency` for the workflow’s `bill_id`.
- Do not trust event payload amounts (events identify work; DB is authority).
- Do not use provider raw response amounts as the journal amount.
- Optionally assert the successful CAPTURED `PaymentAttempt.amount_minor`/`currency` equals the Bill; on mismatch → financial integrity failure (do not post).
- **No fee legs** in the E1 collection journal. Fee recognition (if any) uses later separate journals.

### 4. Account types (closed values for this slice)

| Account | `ledger_accounts.account_type` |
| --- | --- |
| Processor collection clearing | `clearing` |
| Merchant payable | `liability` |

Do not store both `asset` and `clearing` for the same processor collection account. `clearing` is the canonical type for this control account (claim vs processor before bank reconciliation).

### 5. Deterministic account codes and uniqueness

`ledger_accounts.code` is UNIQUE and is the logical identity.

| Account | Code format (exact) | Soft refs on row |
| --- | --- | --- |
| Processor collection clearing | `sys:processor-clearing:{providerCode}:{currency}` | `merchant_id` NULL; `consumer_id` NULL |
| Merchant payable | `mrc:{merchantPublicId}:payable:{currency}` | `merchant_id` = merchant internal UUID; `consumer_id` NULL |

Rules:

- `{providerCode}` = stable Sparelane provider registry key from the **successful CAPTURED PaymentAttempt** for the workflow (e.g. `fake_psp`). Not a display name. Not `provider_transaction_id`.
- `{merchantPublicId}` = merchant opaque public id (`mrc_…` when that prefix is used). Codes must not use display names.
- `{currency}` = ISO 4217 uppercase (e.g. `AUD`).
- Codes are stable across retries, event IDs, and merchant/provider display renames.
- Account display `name` is non-authoritative.

Logical uniqueness implied by code:

- Processor clearing: `(providerCode, currency, purpose=processor-clearing)`
- Merchant payable: `(merchantPublicId, currency, purpose=payable)` → also enforce `merchant_id` matches that merchant

Merchant A’s collection must never credit Merchant B’s payable account.

### 6. Account provisioning

E1 **may ensure / get-or-create** these accounts idempotently on posting (concurrency-safe on unique `code`).

Bootstrap/seed of system clearing accounts is optional; ensure-on-first-use is allowed.

Do not provision settlement, fee, wallet, or suspense accounts for this slice.

### 7. Business reference (binding)

Format (exact):

```text
payment-collection:{paymentWorkflowPublicId}
```

where `{paymentWorkflowPublicId}` is the Payment Workflow opaque public id (`pay_…`).

Semantics:

- One `COLLECTED` Payment Workflow → one `business_reference` → at most one collection `JournalTransaction`.
- Redelivery of `PaymentCollected` reuses the same reference.
- Different workflows get different references even if merchant, bill reference, and amount match.
- Do **not** use outbox/event id, merchant bill reference, or provider transaction id as the journal idempotency key.

Also set `journal_transactions.payment_workflow_id` to the workflow **internal UUID** (soft ref; no cross-DB FK required).

### 8. Traceability

| Concern | Binding approach |
| --- | --- |
| Workflow | `business_reference` + `payment_workflow_id` |
| Merchant | Merchant payable account `merchant_id` + code |
| Provider | Encoded in processor clearing account code via `{providerCode}`; attempt row remains SoT for `provider_transaction_id` |
| Successful attempt | **Indirect**: Workflow → CAPTURED attempt(s). No new journal column required for MVP. Direct attempt FK deferred. |
| Forbidden on journal / account | PAN, CVV, provider token, consumer PII |

### 9. Confirmation status and event

Canonical operational enum value is **`CONFIRMED`** (not `POSTED`):

```text
NOT_REQUIRED | PENDING | CONFIRMED | FAILED
```

On collection:

1. `COLLECTED` sets `ledger_posting_status = PENDING` (existing).
2. After durable collection journal exists with matching substance: `PENDING` → `CONFIRMED` via command `ConfirmLedgerPosting`.
3. Emit internal domain event **`LedgerPostingConfirmed`** in the **same operational transaction** as the status update (transactional outbox). Safe payload: payment/workflow public ids, bill public id, currency, amount as decimal string if needed — no CHD/tokens/PII.

`CONFIRMED` is forbidden if:

- no journal exists for the expected `business_reference`, or
- an existing journal’s substance conflicts with the canonical template (integrity conflict → remain `PENDING`; alert; do not mutate journal).

### 10. Transaction topology (binding)

No XA / 2PC.

1. **Ledger TX:** insert `JournalTransaction` + balanced `JournalEntry` rows (idempotent on `business_reference`).
2. Separately **Operational TX:** `ledger_posting_status` PENDING→CONFIRMED + `LedgerPostingConfirmed` outbox (+ consumer `ProcessedEvent` as applicable).

Crash after (1) before (2): redelivery → journal `already_applied` → then confirm.

Ledger/infrastructure failure: workflow remains `COLLECTED`; `ledger_posting_status` stays `PENDING`. Do **not** move workflow to `FAILED` / `RETRY_PENDING` / `ACTION_REQUIRED`. Posting retry is infrastructure retry — **not** ADR-025 payment retry; no new PaymentAttempt; no PSP call.

### 11. Boundaries

| Concern | E1 collection journal |
| --- | --- |
| Settlement / payout | Out of scope; later journals debit Merchant Payable |
| Bank/PSP cash reconciliation | Out of scope; clearing is pre-reconciliation claim |
| Wallet | Out of scope |
| Fees / revenue / tax / FX | Out of scope |

Merchant payable balance ≠ available-to-settle cash. Processor clearing balance ≠ bank deposit confirmed.

### 12. Multi-provider and multi-currency

- Multiple providers → separate clearing accounts per `{providerCode}:{currency}` so later reconciliation can isolate PSP books.
- Multiple currencies → separate accounts and journals per currency; never balance AUD against USD in one journal.

## Non-normative numeric example

Binding rule applied to Bill AUD `15000` minor units (`150.00`):

```text
Dr  sys:processor-clearing:fake_psp:AUD    15000  AUD
Cr  mrc:mrc_example:payable:AUD            15000  AUD
business_reference = payment-collection:pay_example
```

## Consequences

### Positive

- Platform E1 can implement without inventing accounting policy.
- FIN-INV-02 / FUN-SET-005 have a concrete journal identity.
- FIN-INV-03 applies unchanged (two equal legs).
- Provider-scoped clearing preserves future reconciliation.
- Split-store compatible (OD-019 remains open for physical topology).

### Negative / tradeoffs

- Full CoA still TBD for settlement/fees/refunds/wallet.
- Provider code must be stable in the provider registry before live multi-PSP.
- Gross posting may later need compensating fee/settlement journals.

## Alternatives Considered

1. **Leave legs illustrative** — rejected; blocks Phase E1.
2. **Single aggregate clearing account (all providers)** — rejected; weak multi-PSP reconciliation.
3. **Per-merchant processor clearing** — rejected for MVP; over-fragments system claim; merchant isolation belongs on payable.
4. **Net-of-fees at collection** — rejected; fees not final at COLLECTED; keep fees as later journals.
5. **Dr Bank Cash** — rejected; cash not confirmed at COLLECTED.
6. **Use POSTED instead of CONFIRMED** — rejected; schema/enum already uses `CONFIRMED`.
7. **business_reference = internal UUID** — rejected as primary string form; public workflow id is stable across separate ledger DB ops; internal UUID still stored on `payment_workflow_id`.

## Dependencies / Open Questions

- OD-008 PSP selection / OD-010 capability matrix — still open; `{providerCode}` values come from the selected provider registry.
- OD-019 physical DB topology — still open; this ADR assumes logical separation only.
- Full CoA for settlement, fees, refunds, chargebacks, wallet, tax, FX — **remain TBD**.
- Regulatory/custody characterisation of clearing vs payable for MVP collection operating model — **bound by [ADR-037](./ADR-037-collection-funds-flow-merchant-of-record.md)** (merchant MoR; Sparelane `NO_CUSTODY`; operational accounting only). Production legal confirmation of AU perimeter remains required before live money.

## Related Architecture

- Docs: [ledger-model.md](../money/ledger-model.md), [collection-to-ledger.md](../design/money/collection-to-ledger.md), [transaction-boundaries.md](../implementation/transaction-boundaries.md), [commands-and-events.md](../implementation/commands-and-events.md), [idempotency-storage.md](../schema/idempotency-storage.md)
- ADRs: ADR-004, ADR-005, ADR-013, ADR-016, ADR-017, ADR-020, ADR-021
- Requirements: FUN-SET-005, FUN-SET-006; tests FIN-INV-02, FIN-INV-03
- Designs: SEQ-MONEY-001, SEQ-OPS-002
- Supersedes: “illustrative only / exact legs TBD” **only** for the MVP collection journal slice in ledger-model.md
