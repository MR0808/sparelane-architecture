---
id: INT-NOT-001
title: Email notification delivery
type: integration
area: notifications
status: accepted
priority: must
mvp: true
architecture:
  - experienceApi
flows: []
adrs:
  - ADR-019
contracts: []
modules:
  - Notifications
tests: []
---
# INT-NOT-001 — Email notification delivery

## Requirement

Email notification providers must support delivering consumer/merchant emails without coupling failure to payment financial paths.

## Rationale

Defines required provider interface capabilities for vendor evaluation. Does not select a vendor.

## Acceptance Criteria

- Capability is expressible as an adapter interface in implementation blueprints.
- Unknown/timeout behaviours have a safe reconciliation path where money movement is involved.

## Notes

Vendors remain open decisions.
