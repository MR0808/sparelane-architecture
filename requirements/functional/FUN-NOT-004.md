---
id: FUN-NOT-004
title: Payment collected consumer notification
type: functional
area: notifications
status: accepted
implementationStatus: implemented
priority: must
mvp: true
adrs:
  - ADR-031
modules:
  - Notifications
tests:
  - CON-NOT-001
designs:
  - SEQ-NOT-003
---
# FUN-NOT-004 — Payment collected consumer notification

## Requirement

On `PaymentCollected`, Sparelane must project one mandatory transactional success confirmation email to the consumer's ACTIVE default contact.

## Rationale

Consumer confirmation of successful collection separate from merchant webhook.

## Acceptance Criteria

- Idempotency key `notify:payment.collected:{paymentWorkflowPublicId}`.
- Template `payment_collected_v1`.
- Safe variables only (no ledger/settlement/provider internals).
- SKIPPED when no ACTIVE default contact.

## Notes

Mandatory transactional in G2.
