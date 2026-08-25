# Ledger Model

Conceptual financial model for Sparelane money movement after Payment Workflow reaches `COLLECTED`.

## Chart of accounts status

| Slice | Status |
| --- | --- |
| **MVP successful collection journal** | **Binding** — [ADR-026](../decisions/ADR-026-collection-ledger-posting-minimal-coa.md) |
| **MVP confirmed payout (settlement) journal** | **Binding** — [ADR-029](../decisions/ADR-029-settlement-finality-reconciliation-payout-accounting.md) |
| Fees, refunds, chargebacks, wallet, tax, FX, bank-cash statement adjustments | **TBD** with accounting, banking and regulatory advice |

Final enterprise CoA remains incomplete outside the ADR-026 collection slice and ADR-029 payout slice.

## Purpose

Payment workflow state describes operational collection progress.

The **double-entry ledger** is the authoritative record of financial position and movement.

Derived balances (Balance Service) must be reproducible from ledger entries.

## Account types (architecture level)

| Type | Practical meaning | MVP collection use |
| --- | --- | --- |
| **Asset** | Claims Sparelane holds or controls for settlement/clearing purposes | Not used for MVP collection legs; ADR-037: Sparelane does **not** custody merchant collection proceeds |
| **Liability** | Amounts owed to consumers (wallet) or merchants (payable) | Merchant payable |
| **Revenue** | Platform fees earned when product rules allow recognition | Not in collection journal |
| **Clearing / control** | Temporary accounts used to move value between collection, processor, settlement and exception handling | Processor collection clearing; settlement-partner clearing (`account_type = clearing`) |

## Conceptual accounts (broader CoA — not all frozen)

Sparelane is likely to require accounts such as:

```text
Consumer Wallet Liability
Merchant Payable                 ← MVP collection CREDIT (ADR-026)
Settlement Clearing
Platform Fee Revenue
Processor / Acquirer Clearing    ← MVP collection DEBIT (ADR-026)
Suspense / Exception
```

Notes:

- MVP collection/settlement operating model: [ADR-037](../decisions/ADR-037-collection-funds-flow-merchant-of-record.md) — merchant MoR; Sparelane `NO_CUSTODY`; connected/sub-merchant funds landing.
- Outside ADR-026/029/037, do not treat these names as a final CoA.
- Multi-currency FX, merchant reserves and lending accounts are out of Phase 3 scope.

## Journal Transaction

```text
Journal Transaction
    1
    └── 2..N Journal Entries
```

Every journal transaction must balance (`total debits = total credits`) per currency.

### Conceptual journal entry fields

Each entry conceptually includes:

- journal transaction ID
- account reference
- debit or credit
- amount
- currency
- timestamp
- business reference (**Sparelane-generated financial posting identity**; unique per financial effect — e.g. collection for a payment workflow. Not a merchant or provider reference.)
- source event/command reference
- optional payment workflow reference
- optional payment attempt reference
- optional settlement reference

Exact database columns are designed in [`docs/schema/relational-model.md`](../schema/relational-model.md).

### Ledger posting uniqueness

```text
The same business financial effect must resolve to the same unique ledger-posting identity.
```

Merchant reconciliation references and provider references remain separate.

## MVP successful collection posting (binding — ADR-026 + ADR-037 economics)

Economic event: verified PSP collection on the merchant’s **connected/sub-merchant** account → operational processor clearing recognition + merchant payable eligibility (gross Bill amount). **Not** Sparelane bank cash. **Not** Sparelane legal custody of client money ([ADR-037](../decisions/ADR-037-collection-funds-flow-merchant-of-record.md)). Not settlement. Not fees.

| Leg | Side | Account code | Scope | `account_type` | Amount | Currency |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | DEBIT | `sys:processor-clearing:{providerCode}:{currency}` | Platform | `clearing` | Bill `amount_minor` | Bill `currency` |
| 2 | CREDIT | `mrc:{merchantPublicId}:payable:{currency}` | Merchant | `liability` | Bill `amount_minor` | Bill `currency` |

**Economic interpretation (ADR-037):**

| Account | Meaning |
| --- | --- |
| Processor clearing | Operational control for verified provider-backed collection evidence — **not** Sparelane-held client money |
| Merchant payable | Operational payable eligibility for provider-mediated merchant settlement — **not** Sparelane custodian liability for pooled funds |

Funds land first in the **merchant connected/sub-merchant PSP balance** (provider-controlled).

- `transaction_type` = `collection`
- `business_reference` = `payment-collection:{paymentWorkflowPublicId}`
- Trigger event: `PaymentCollected`
- After durable journal: `ledger_posting_status` PENDING → **CONFIRMED**; emit `LedgerPostingConfirmed`
- No fee/wallet/settlement legs

See [ADR-026](../decisions/ADR-026-collection-ledger-posting-minimal-coa.md) for provisioning, crash windows, conflicts, and boundaries.

### Non-normative example (applies ADR-026)

AUD 150.00 (`amount_minor = 15000`), provider `fake_psp`, merchant public id `mrc_example`, workflow public id `pay_example`:

```text
Dr  sys:processor-clearing:fake_psp:AUD    15000
Cr  mrc:mrc_example:payable:AUD            15000
business_reference = payment-collection:pay_example
```

## Other conceptual postings (still illustrative / TBD)

### Wallet reservation

```text
Dr Consumer Wallet Available (or equivalent control)
Cr Consumer Wallet Reserved
```

Reservation is not final spend. Exact legs TBD.

### Merchant settlement / confirmed payout (binding — ADR-029 + ADR-037 economics)

Economic event: provider-adapter-normalised **provider-mediated** payout **completed** for one SettlementInstruction (from merchant connected/sub-merchant balance to merchant bank destination) → discharge merchant payable + recognise settlement clearing (gross). **Not** Sparelane bank cash / custody ([ADR-037](../decisions/ADR-037-collection-funds-flow-merchant-of-record.md)). Not fee netting. Not a mutation of PSP `processor-clearing`.

| Leg | Side | Account code | Scope | `account_type` | Amount | Currency |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | DEBIT | `mrc:{merchantPublicId}:payable:{currency}` | Merchant | `liability` | `Settlement.amount_minor` | `Settlement.currency` |
| 2 | CREDIT | `sys:settlement-clearing:{settlementProviderCode}:{currency}` | Platform | `clearing` | `Settlement.amount_minor` | `Settlement.currency` |

**Economic interpretation (ADR-037):** `settlement-clearing` is a control account for provider-mediated payout completion — preferably the same PSP’s connected-account payout rail (OD-009 narrowed) — not Sparelane ADI cash.

- `transaction_type` = `settlement_payout`
- `business_reference` = `settlement-payout:{settlementPublicId}`
- Trigger path: `ReconcileSettlement` with canonical outcome `settled` → journal → Settlement `SETTLED` → `SettlementSettled`
- [ADR-028](../decisions/ADR-028-settlement-execution-payout-destination-instruction-idempotency.md) F1 may submit Fake **without** this journal; F2 requires this journal before `SETTLED`
- Bank-cash / statement reconciliation remains a later independent control (not required for MVP `SETTLED`)

## MVP compensating correction posting (binding — ADR-036)

Economic event: privileged books correction against an eligible **collection** journal — reverse sides on the same accounts for amount `A` ≤ remaining capacity. Not a PSP refund. Not a payout reverse. Not a mutation of PaymentWorkflow / Settlement status.

| Leg | Side | Account code | Scope | `account_type` | Amount | Currency |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | CREDIT | same processor-clearing as source DEBIT | Platform | `clearing` | `A` | source currency |
| 2 | DEBIT | same merchant-payable as source CREDIT | Merchant | `liability` | `A` | source currency |

- `transaction_type` = `correction`
- `business_reference` = `ledger-correction:{parPublicId}`
- `corrects_journal_transaction_id` → source collection journal (immutable FK)
- Original journal remains forever immutable (no UPDATE/DELETE)
- Partial / multiple corrections allowed until remaining = 0; correction-of-correction **NOT SUPPORTED**
- Settlement create/execute must refuse when remaining uncompensated collection amount ≤ 0

See [ADR-036](../decisions/ADR-036-financial-compensating-correction-policy.md) and [SEQ-MONEY-007](../design/money/ledger-compensating-correction.md).

## Ledger Invariants

1. Every journal transaction balances.
2. Posted entries are immutable.
3. Corrections use compensating entries (never update-in-place) — MVP workflow: [ADR-036](../decisions/ADR-036-financial-compensating-correction-policy.md).
4. Currency must balance independently.
5. Journal posting must be idempotent for the same source event/command.
6. Financial references must be traceable to the originating business event.
7. Operational↔ledger consistency uses transactional outbox + idempotent posting ([ADR-016](../decisions/ADR-016-operational-ledger-consistency.md)); brief `COLLECTED` without journal is allowed with recovery; settlement waits for `CONFIRMED`.
8. Settlement may only consume eligible payable funds — per-collection Settlement obligation ([ADR-027](../decisions/ADR-027-settlement-obligation-eligibility-cardinality.md)), not arbitrary aggregate account balance alone; remaining capacity reduced by ADR-036 corrections.
9. Derived balances must be reproducible from ledger entries.
10. One successful collection → exactly one collection journal ([ADR-026](../decisions/ADR-026-collection-ledger-posting-minimal-coa.md), FIN-INV-02).
11. One confirmed collection → at most one Settlement ([ADR-027](../decisions/ADR-027-settlement-obligation-eligibility-cardinality.md)).

### Implementation questions TBD (outside ADR-026 / ADR-027 / ADR-029 / ADR-036 / ADR-037)

- materialised balance cache invalidation strategy
- remaining CoA for fees / refunds / wallet / suspense / bank-cash statement
- fee recognition timing (production net-payout blocker)
- treatment of processor settlement reports versus Sparelane collection events (independent of MVP SETTLED)
- settlement-clearing → optional bank-cash statement control (Sparelane does not custody under ADR-037; bank statement is independent control)

## Related docs

- [Settlement state machine](settlement-state-machine.md)
- [Reconciliation](reconciliation.md)
- [Wallet](wallet.md)
- [ADR-004 Double-entry ledger](../decisions/ADR-004-double-entry-ledger.md)
- [ADR-005 Collection before settlement](../decisions/ADR-005-collection-before-settlement.md)
- [ADR-026 Collection ledger posting / minimal CoA](../decisions/ADR-026-collection-ledger-posting-minimal-coa.md)
- [ADR-027 Settlement obligation / eligibility](../decisions/ADR-027-settlement-obligation-eligibility-cardinality.md)
- [ADR-029 Settlement finality / payout accounting](../decisions/ADR-029-settlement-finality-reconciliation-payout-accounting.md)
- [ADR-036 Financial compensating correction policy](../decisions/ADR-036-financial-compensating-correction-policy.md)
- [ADR-037 Collection funds-flow / MoR operating model](../decisions/ADR-037-collection-funds-flow-merchant-of-record.md)
