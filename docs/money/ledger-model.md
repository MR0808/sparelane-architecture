# Ledger Model

Conceptual financial model for Sparelane money movement after Payment Workflow reaches `COLLECTED`.

## Chart of accounts status

| Slice | Status |
| --- | --- |
| **MVP successful collection journal** | **Binding** — [ADR-026](../decisions/ADR-026-collection-ledger-posting-minimal-coa.md) |
| Settlement, fees, refunds, chargebacks, wallet, tax, FX, reconciliation adjustments | **TBD** with accounting, banking and regulatory advice |

Final enterprise CoA remains incomplete outside the ADR-026 collection slice.

## Purpose

Payment workflow state describes operational collection progress.

The **double-entry ledger** is the authoritative record of financial position and movement.

Derived balances (Balance Service) must be reproducible from ledger entries.

## Account types (architecture level)

| Type | Practical meaning | MVP collection use |
| --- | --- | --- |
| **Asset** | Claims Sparelane holds or controls for settlement/clearing purposes (exact legal characterisation TBD) | Not used for MVP collection legs |
| **Liability** | Amounts owed to consumers (wallet) or merchants (payable) | Merchant payable |
| **Revenue** | Platform fees earned when product rules allow recognition | Not in collection journal |
| **Clearing / control** | Temporary accounts used to move value between collection, processor, settlement and exception handling | Processor collection clearing (`account_type = clearing`) |

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

- Terminology is cautious because custody, safeguarding and commercial structure depend on the selected PSP/banking partner and regulatory advice.
- Outside ADR-026, do not treat these names as a final CoA.
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

## MVP successful collection posting (binding — ADR-026)

Economic event: verified PSP collection → processor clearing claim + merchant payable eligibility (gross Bill amount). Not bank cash. Not settlement. Not fees.

| Leg | Side | Account code | Scope | `account_type` | Amount | Currency |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | DEBIT | `sys:processor-clearing:{providerCode}:{currency}` | Platform | `clearing` | Bill `amount_minor` | Bill `currency` |
| 2 | CREDIT | `mrc:{merchantPublicId}:payable:{currency}` | Merchant | `liability` | Bill `amount_minor` | Bill `currency` |

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

### Merchant settlement

```text
Dr Merchant Payable
Cr Settlement Clearing
```

then on confirmed payout:

```text
Dr Settlement Clearing
Cr Processor / Bank Clearing (or equivalent)
```

Settlement / payout legs remain TBD with accounting advice (beyond ADR-026). [ADR-028](../decisions/ADR-028-settlement-execution-payout-destination-instruction-idempotency.md) allows F1 Fake provider submission **without** a settlement journal; production money requires payout CoA + reconciliation.

## Ledger Invariants

1. Every journal transaction balances.
2. Posted entries are immutable.
3. Corrections use compensating entries (never update-in-place).
4. Currency must balance independently.
5. Journal posting must be idempotent for the same source event/command.
6. Financial references must be traceable to the originating business event.
7. Operational↔ledger consistency uses transactional outbox + idempotent posting ([ADR-016](../decisions/ADR-016-operational-ledger-consistency.md)); brief `COLLECTED` without journal is allowed with recovery; settlement waits for `CONFIRMED`.
8. Settlement may only consume eligible payable funds — per-collection Settlement obligation ([ADR-027](../decisions/ADR-027-settlement-obligation-eligibility-cardinality.md)), not arbitrary aggregate account balance alone.
9. Derived balances must be reproducible from ledger entries.
10. One successful collection → exactly one collection journal ([ADR-026](../decisions/ADR-026-collection-ledger-posting-minimal-coa.md), FIN-INV-02).
11. One confirmed collection → at most one Settlement ([ADR-027](../decisions/ADR-027-settlement-obligation-eligibility-cardinality.md)).

### Implementation questions TBD (outside ADR-026 / ADR-027)

- materialised balance cache invalidation strategy
- remaining CoA numbering for settlement execution / fees / refunds / wallet / suspense
- fee recognition timing (production net-payout blocker)
- treatment of processor settlement reports versus Sparelane collection events (reconciliation)

## Related docs

- [Settlement state machine](settlement-state-machine.md)
- [Reconciliation](reconciliation.md)
- [Wallet](wallet.md)
- [ADR-004 Double-entry ledger](../decisions/ADR-004-double-entry-ledger.md)
- [ADR-005 Collection before settlement](../decisions/ADR-005-collection-before-settlement.md)
- [ADR-026 Collection ledger posting / minimal CoA](../decisions/ADR-026-collection-ledger-posting-minimal-coa.md)
- [ADR-027 Settlement obligation / eligibility](../decisions/ADR-027-settlement-obligation-eligibility-cardinality.md)
