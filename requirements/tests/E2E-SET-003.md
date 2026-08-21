---
id: E2E-SET-003
title: Unknown settlement outcome
type: e2e
status: specified
relatedRequirements:
  - FUN-SET-003
  - NFR-REL-005
relatedFlows:
  - unknownSettlementOutcome
mvp: true
---

# E2E-SET-003 — Unknown settlement outcome

## Purpose

Verify settlement lifecycle path `unknownSettlementOutcome` ([ADR-028](../../docs/decisions/ADR-028-settlement-execution-payout-destination-instruction-idempotency.md)).

## Preconditions

- Collected funds posted to ledger where required; Settlement ELIGIBLE with destination.
- Fake settlement partner scripted to return `unknown_outcome` then lookup truth.

## Scenario

1. ExecuteSettlementInstruction → provider `unknown_outcome`
2. Assert Settlement SUBMITTED + instruction OUTCOME_UNKNOWN + reconcile hold
3. Assert no second instruction / no new idempotency key / not FAILED / not SETTLED
4. Lookup with same key adopts provider truth without duplicate transfer
5. Cross-checks: merchant/KYB/destination recheck blocks; cross-merchant destination rejected

## Expected result

Unknown path matches ADR-028. Blind resubmit forbidden.

## Implementation status

`specified`
