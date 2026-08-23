---
id: FUN-NOT-005
title: Consumer notification delivery and idempotency
type: functional
area: notifications
status: accepted
implementationStatus: implemented
priority: must
mvp: true
adrs:
  - ADR-017
  - ADR-031
modules:
  - Notifications
tests:
  - CON-NOT-001
dependsOn:
  - FUN-NOT-001
---
# FUN-NOT-005 — Consumer notification delivery and idempotency

## Requirement

Consumer notification delivery must use provider-neutral email port semantics with bounded retry, stable idempotency, and fail-closed production behaviour.

## Rationale

Prevents duplicate logical notifications, unsafe provider coupling, and Fake email in production.

## Acceptance Criteria

- `EmailProvider.sendEmail` contract per ADR-031.
- Fake provider `nonProductionOnly`; records messages for tests.
- Production/sandbox fail closed without approved provider (OD-035).
- Retry: 5 attempts; delays 2m/10m/1h/6h; retry technical_error/unknown only.
- `accepted` ≠ inbox delivery.
- Crash replay with same idempotency key does not create duplicate logical notification when provider supports idempotency.
- Metrics/logs exclude email addresses.

## Notes

See INT-NOT-001 for adapter evaluation criteria.
