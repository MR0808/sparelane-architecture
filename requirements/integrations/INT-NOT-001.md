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

**Phase G:** Email delivery is **deferred** past G0/G1 ([ADR-030](../../docs/decisions/ADR-030-merchant-webhook-contract-signing-and-delivery.md), [OD-005](../../docs/decisions/open/OD-005-notification-rules.md)). Adapter interface may exist; do not implement consumer email until contact ownership is Accepted.
