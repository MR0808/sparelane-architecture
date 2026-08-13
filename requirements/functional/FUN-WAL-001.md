---
id: FUN-WAL-001
title: Optional consumer wallet capability
type: functional
area: wallet
status: deferred
priority: could
mvp: false
architecture:
  - fundsLedger
flows: []
adrs:
  - ADR-004
contracts: []
modules:
  - Wallet
tests: []
---
# FUN-WAL-001 — Optional consumer wallet capability

## Requirement

Sparelane may provide an optional wallet capability in a future release, subject to licensing and custody open decisions.

## Rationale

Wallet is modelled as future/optional; not MVP.

## Acceptance Criteria

- Wallet is not required for MVP payment reliability.
- Any future wallet go-live requires resolved open decisions and additional ADRs if custody model changes architecture.

## Notes

status: deferred; mvp: false.
