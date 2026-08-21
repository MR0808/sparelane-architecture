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
  - ADR-028
contracts: []
modules:
  - Settlement
  - Reconciliation
tests:
  - FIN-INV-06
  - E2E-SET-003
designs:
  - SEQ-MONEY-005
---
# FUN-SET-003 — Handle unknown payout outcomes safely

## Requirement

When settlement payout outcome is unknown, Sparelane must not blindly resubmit; it must reconcile via provider lookup/status before further action.

Binding ([ADR-028](../../docs/decisions/ADR-028-settlement-execution-payout-destination-instruction-idempotency.md)):

- Persist Settlement **SUBMITTED** + instruction **OUTCOME_UNKNOWN** + reconcile hold
- Do not create a new instruction, change idempotency key, switch provider, mark FAILED to force retry, or mark SETTLED
- Call `lookupSettlementInstruction` with the same key / provider ref

## Rationale

FIN-INV-06 and NFR-REL-005; ADR-028 unknown taxonomy.

## Acceptance Criteria

- Unknown outcomes enter a safe holding/reconcile path.
- No automatic duplicate settlement submission on timeout alone.
- Lookup precedes any safe retry; same instruction identity retained.

## Notes

Money movement MVP. F1 Fake may implement lookup; full SETTLED reconciliation is F2+.
