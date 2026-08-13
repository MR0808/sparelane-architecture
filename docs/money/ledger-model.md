# Ledger Model

Conceptual financial model for Sparelane money movement after Payment Workflow reaches `COLLECTED`.

Final chart-of-accounts design is:

```text
TBD with accounting, banking and regulatory advice
```

## Purpose

Payment workflow state describes operational collection progress.

The **double-entry ledger** is the authoritative record of financial position and movement.

Derived balances (Balance Service) must be reproducible from ledger entries.

## Account types (architecture level)

| Type | Practical meaning |
|---|---|
| **Asset** | Claims Sparelane holds or controls for settlement/clearing purposes (exact legal characterisation TBD) |
| **Liability** | Amounts owed to consumers (wallet) or merchants (payable) |
| **Revenue** | Platform fees earned when product rules allow recognition |
| **Clearing / control** | Temporary accounts used to move value between collection, processor, settlement and exception handling |

## Conceptual accounts

Sparelane is likely to require accounts such as:

```text
Consumer Wallet Liability
Merchant Payable
Settlement Clearing
Platform Fee Revenue
Processor / Acquirer Clearing
Suspense / Exception
```

Notes:

- Terminology is cautious because custody, safeguarding and commercial structure depend on the selected PSP/banking partner and regulatory advice.
- Do not treat these names as a final CoA.
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

## Example conceptual postings (illustrative only)

### Successful consumer collection

Creates merchant payable eligibility (simplified):

```text
Dr Processor / Acquirer Clearing
Cr Merchant Payable
```

Fee recognition (if applicable and permitted by product/accounting rules) may add additional balanced legs.

### Wallet reservation

```text
Dr Consumer Wallet Available (or equivalent control)
Cr Consumer Wallet Reserved
```

Reservation is not final spend.

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

Exact legs remain TBD with accounting advice.

## Ledger Invariants

1. Every journal transaction balances.
2. Posted entries are immutable.
3. Corrections use compensating entries (never update-in-place).
4. Currency must balance independently.
5. Journal posting must be idempotent for the same source event/command.
6. Financial references must be traceable to the originating business event.
7. Ledger posting and payment-workflow updates must avoid inconsistent partial completion (for example workflow `COLLECTED` without corresponding journal, or journal without workflow confirmation) — exact transactional strategy TBD.
8. Settlement may only consume eligible payable funds.
9. Derived balances must be reproducible from ledger entries.

### Implementation questions TBD

- single DB transaction vs transactional outbox across operational DB and ledger DB
- materialised balance cache invalidation strategy
- account numbering / CoA ownership
- fee recognition timing
- treatment of processor settlement reports versus Sparelane collection events

## Related docs

- [Settlement state machine](settlement-state-machine.md)
- [Reconciliation](reconciliation.md)
- [Wallet](wallet.md)
- [ADR-004 Double-entry ledger](../decisions/ADR-004-double-entry-ledger.md)
- [ADR-005 Collection before settlement](../decisions/ADR-005-collection-before-settlement.md)
