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

Verify settlement lifecycle path `unknownSettlementOutcome` ([ADR-028](../../docs/decisions/ADR-028-settlement-execution-payout-destination-instruction-idempotency.md), [ADR-029](../../docs/decisions/ADR-029-settlement-finality-reconciliation-payout-accounting.md)).

## Preconditions

- Collected funds posted to ledger where required; Settlement ELIGIBLE with destination.
- Fake settlement partner scripted to return `unknown_outcome` then lookup truth variants.

## Scenario

1. ExecuteSettlementInstruction → provider `unknown_outcome`
2. Assert Settlement SUBMITTED + instruction OUTCOME_UNKNOWN + reconcile hold
3. Assert no second instruction / no new idempotency key / not FAILED / not SETTLED
4. `ReconcileSettlement` / lookup with same key:
   - `pending` → optional PROCESSING; no journal; not SETTLED
   - `settled` → one payout journal → SETTLED (no second transfer)
   - `failed` → FAILED; no payout journal
   - `not_found` → integrity hold; **no** resubmit; not SETTLED
   - `unknown` → remain hold; no resubmit
5. Cross-checks: merchant isolation; amount/currency mismatch blocks SETTLED

## Expected result

Unknown path matches ADR-028/029. Blind resubmit forbidden. SETTLED only with finality + journal.

## Implementation status

`specified`
