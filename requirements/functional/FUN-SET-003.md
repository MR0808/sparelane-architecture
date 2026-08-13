---
id: FUN-SET-003
title: Handle unknown payout outcomes safely
type: functional
area: settlement
status: accepted
priority: must
mvp: true
architecture:
  - settlementCore
flows:
  - unknownSettlementOutcome
  - settlementFailure
adrs:
  - ADR-006
contracts: []
modules:
  - Settlement
  - Reconciliation
tests:
  - FIN-INV-06
---
# FUN-SET-003 — Handle unknown payout outcomes safely

## Requirement

When settlement payout outcome is unknown, Sparelane must not blindly resubmit; it must reconcile via provider lookup/status before further action.

## Rationale

FIN-INV-06 and NFR-REL-005.

## Acceptance Criteria

- Unknown outcomes enter a safe holding/reconcile path.
- No automatic duplicate settlement submission on timeout alone.

## Notes

Money movement MVP.
