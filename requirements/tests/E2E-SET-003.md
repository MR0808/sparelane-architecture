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

Verify settlement lifecycle path `unknownSettlementOutcome`.

## Preconditions

- Collected funds posted to ledger where required.
- Fake settlement partner scripted.

## Scenario

Execute settlement path for unknown settlement outcome.

## Expected result

Settlement state machine and reconciliation behaviour match ADRs.

## Implementation status

`specified`
