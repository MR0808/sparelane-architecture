# Phase E1 — Accounting decision gate (architecture)

**Status:** PASS — binding template in [ADR-026](../decisions/ADR-026-collection-ledger-posting-minimal-coa.md)

Platform previously stopped E1 because collection legs were illustrative only. ADR-026 unblocks implementation.

## Platform E1 must implement

1. `PaymentCollected` consumer (reload workflow + Bill; amount from Bill)
2. Ensure accounts: `sys:processor-clearing:{providerCode}:{currency}`, `mrc:{merchantPublicId}:payable:{currency}`
3. `appendJournal` with `business_reference = payment-collection:{paymentWorkflowPublicId}`, `transaction_type = collection`
4. Legs: Dr clearing / Cr payable at Bill `amount_minor`
5. Separate operational `ConfirmLedgerPosting` → `CONFIRMED` + `LedgerPostingConfirmed` outbox
6. Tests: FIN-INV-02/03 scenarios in FIN-INV-02.md; crash windows; no settlement/wallet/PSP

## Must not invent

Alternate CoA legs, fee entries, `POSTED` status, or settlement journals.

## Still TBD (not E1 blockers)

Settlement CoA, fees, refunds, wallet, OD-019 topology, OD-008 PSP selection.
