---
id: FUN-NOT-003
title: Payment failed consumer notification
type: functional
area: notifications
status: accepted
implementationStatus: implemented
priority: must
mvp: true
adrs:
  - ADR-024
  - ADR-025
  - ADR-031
modules:
  - Notifications
tests:
  - CON-NOT-001
designs:
  - SEQ-NOT-002
  - SEQ-PAY-006
dependsOn:
  - FUN-PAY-007
---
# FUN-NOT-003 — Payment failed consumer notification

## Requirement

On terminal `PaymentFailed`, Sparelane must project one mandatory transactional email to the consumer (in addition to merchant webhook per FUN-PAY-007).

## Rationale

Honest terminal outcome communication to the payment party.

## Acceptance Criteria

- Trigger only on terminal `FAILED`, not intermediate declines.
- Idempotency key `notify:payment.failed:{paymentWorkflowPublicId}`.
- Template `payment_failed_v1`.
- SKIPPED when no ACTIVE default contact.
- No financial mutation on delivery outcome.

## Notes

Complements SEQ-PAY-006 consumer notify step.
