---
id: FUN-BIL-002
title: Schedule payment actions against due dates
type: functional
area: bills
status: accepted
priority: must
mvp: true
architecture:
  - paymentEngineCore
flows:
  - billIngestion
  - scheduledRetry
adrs:
  - ADR-002
contracts: []
modules:
  - Bills
  - Reliability Engine
tests: []
---
# FUN-BIL-002 — Schedule payment actions against due dates

## Requirement

Sparelane must schedule payment reliability actions relative to bill due dates according to configured policy.

## Rationale

Due-date-aware scheduling is required for recurring bill reliability.

## Acceptance Criteria

- Eligible bills produce scheduled payment actions before/at due policy windows.
- Scheduling respects workflow state and does not double-schedule conflicting collections.

## Notes

Exact schedule knobs may remain open decisions.
