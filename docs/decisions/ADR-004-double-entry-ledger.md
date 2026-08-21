# ADR-004 — Double-entry Ledger

## Status

Accepted

## Context

Sparelane moves money conceptually through collection, optional wallet balances, merchant payables and settlement. Payment Workflow state alone cannot be the authoritative financial record: it describes operational progress, not financial position.

Sparelane also needs auditability, reconciliation against providers, and safe correction of mistakes without rewriting history.

## Decision

Sparelane uses a **double-entry financial ledger** as the authoritative record of financial movements.

- Journal transactions are balanced (`debits = credits`) per currency
- Posted entries are append-only/immutable
- Corrections use compensating entries
- Balance Service derives balances from the ledger; caches are not authoritative

## Consequences

### Positive

- financial correctness and auditability
- clear separation from payment workflow state
- supports payment, financial and merchant reconciliation
- enables settlement to consume only eligible payable funds

### Negative / tradeoffs

- higher implementation and operational complexity than a single balance table
- requires disciplined idempotent posting and compensating-entry practices
- needs accounting/regulatory advice for **remaining** chart of accounts and custody treatment beyond the MVP collection slice ([ADR-026](./ADR-026-collection-ledger-posting-minimal-coa.md))
## Alternatives Considered

1. **Derive balances only from payment workflow statuses** — rejected; insufficient for settlement, audit and provider reconciliation.
2. **Mutable balance rows without journal history** — rejected; weak audit trail and unsafe corrections.
3. **Fully outsource ledger to PSP/bank statements only** — rejected as sole source; Sparelane still needs internal enforceable controls between collection and payout.
