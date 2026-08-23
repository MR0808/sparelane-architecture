---
id: FUN-NOT-002
title: Payment action required consumer notification
type: functional
area: notifications
status: accepted
implementationStatus: implemented
priority: must
mvp: true
adrs:
  - ADR-024
  - ADR-031
modules:
  - Notifications
  - Payment Workflows
tests:
  - CON-NOT-001
designs:
  - SEQ-NOT-001
---
# FUN-NOT-002 — Payment action required consumer notification

## Requirement

When a payment workflow enters `ACTION_REQUIRED` for the first time, Sparelane must project one mandatory transactional email notification to the consumer's ACTIVE default notification contact.

## Rationale

Consumer must be informed when automatic recovery cannot continue but remediation is still possible.

## Acceptance Criteria

- Trigger on first `ACTION_REQUIRED` entry only — not on every retryable decline.
- Idempotency key `notify:payment.action_required:{paymentWorkflowPublicId}`.
- Uses template `payment_action_required_v1`.
- No provider call when no ACTIVE default contact (`SKIPPED`).
- Delivery failure does not mutate payment workflow state.

## Notes

Mandatory transactional; no opt-out in G2.
