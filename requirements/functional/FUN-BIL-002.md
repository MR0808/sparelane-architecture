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
  - ADR-025
contracts: []
modules:
  - Bills
  - Reliability Engine
tests: []
openDecisions: []
designs:
  - SEQ-PAY-001
---
# FUN-BIL-002 — Schedule payment actions against due dates

## Requirement

Sparelane must schedule payment reliability actions relative to bill due dates according to configured policy.

## Rationale

Due-date-aware scheduling is required for recurring bill reliability.

## Acceptance Criteria

- Eligible bills produce scheduled payment actions before/at due policy windows.
- Due execution uses **09:00** frozen merchant IANA timezone on `dueDate` ([ADR-025](../../docs/decisions/ADR-025-payment-retry-timing-budget-and-recovery-window.md)).
- Scheduling respects workflow state and does not double-schedule conflicting collections.
- Merchant timezone changes do not silently move already-persisted `ScheduledJob` UTC times.

## Notes

Exact MVP clock/cutoff defaults are ADR-025. Future merchant overrides within ADR bounds are optional product work.