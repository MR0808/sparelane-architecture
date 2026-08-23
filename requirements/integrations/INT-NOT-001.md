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
  - ADR-031
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

**Phase G:** Consumer email delivery unblocked for **local G2** by [ADR-031](../../docs/decisions/ADR-031-consumer-notification-contact-channel-and-delivery-policy.md) (resolves [OD-005](../../docs/decisions/open/OD-005-notification-rules.md) core). Production/pilot requires [OD-035](../../docs/decisions/open/OD-035-email-provider.md). Adapter interface must match ADR-031 `EmailProvider` port; Fake `nonProductionOnly`.
