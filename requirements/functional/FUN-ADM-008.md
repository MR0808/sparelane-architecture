---
id: FUN-ADM-008
title: Controlled merchant webhook replay
type: functional
area: admin
status: accepted
implementationStatus: verified
priority: must
mvp: true
architecture:
  - dlqReplay
  - adminPrivilegedAction
adrs:
  - ADR-030
  - ADR-033
  - ADR-034
contracts:
  - docs/operations/dead-letter-handling.md
  - docs/security/admin-access.md
modules:
  - Admin Control Plane
  - Webhooks
  - Workers
tests:
  - ADM-REPLAY-001
  - ADM-REPLAY-002
  - ADM-REPLAY-003
  - ADM-REPLAY-004
  - ADM-REPLAY-005
  - ADM-REPLAY-006
  - WH-REPLAY-001
designs:
  - SEQ-OPS-003
  - SEQ-OPS-005
---
# FUN-ADM-008 — Controlled merchant webhook replay

## Requirement

Platform admins with `admin.webhook.replay` may request exactly one closed replay action — `admin.webhook.replay` — for eligible webhook dead-letter items, preserving the same `WebhookEvent` (`evt_…`) and `WebhookDelivery` identity, under recent MFA and mandatory reason.

## Rationale

ADR-034 binds ADR-030 operator replay without generic financial or notification replay.

## Acceptance Criteria

- Closed catalogue: `admin.webhook.replay` only.
- Creates `OperatorReplayRequest` (`rpl_…`); execute-once; worker performs HTTP (notification-worker).
- Same `evt_` + immutable body; fresh HMAC; endpoint must be ACTIVE; attempt number continues (6+); no automatic 5-retry restart after manual failure.
- Financial / notification / arbitrary work replay rejected.
- Concurrent active replay requests collapsed to one per DLQ item.
- Durable audit for request/execute/success/fail/deny.
- No mutation of Bill / PaymentWorkflow / PaymentAttempt / Journal / Settlement entities.

## Notes

implementationStatus: designed — platform H2 not started. Dual control not required for webhook replay.
