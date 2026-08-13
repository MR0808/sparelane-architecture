# Sparelane Wallet Capability

Conceptual wallet behaviour for MVP architecture.

This document describes an optional **Sparelane wallet capability**. It does **not** assert that Sparelane has already decided to operate a legally regulated stored-value facility itself.

## Current conceptual behaviour

- Optional consumer wallet used as a fallback payment method where enabled and permitted
- Balance concepts: **available**, **reserved**, **spent** (as applicable)
- Financial state is ledger-backed via the double-entry ledger
- Funds Reservation may reserve eligible wallet funds before final movement
- Reservation can be released or consumed
- Configurable maximum balance may apply (product configuration / TBD)
- Wallet payment creates a distinct Payment Attempt like other rails

## What wallet is not (Phase 3)

- Not a card balance Sparelane controls at the scheme/issuer
- Not a payment guarantee / credit facility
- Not a fully designed funding product

## Explicitly TBD

Mark the following as unresolved:

- wallet funding method
- safeguarding model
- licensing / regulatory treatment
- external custodial model
- whether Sparelane or a partner is the legal holder of customer funds
- interest, rewards or promotional wallet mechanics

Retain `#proposed`, `#sensitive` and `#financial` tags on the wallet capability in the LikeC4 model until these decisions are made and recorded in ADRs.

## Related docs

- [Ledger model](ledger-model.md)
- [Payment method selection](../payments/payment-method-selection.md)
- [ADR-004 Double-entry ledger](../decisions/ADR-004-double-entry-ledger.md)
