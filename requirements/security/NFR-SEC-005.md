---
id: NFR-SEC-005
title: Signed merchant webhooks
type: non-functional
area: security
status: accepted
priority: must
mvp: true
architecture:
  - merchantIntegration
  - trustBoundaries
flows:
  - merchantWebhookDelivery
adrs:
  - ADR-009
contracts:
  - docs/security/webhook-security.md
modules:
  - Webhooks
tests: []
---
# NFR-SEC-005 — Signed merchant webhooks

## Requirement

Outbound merchant webhooks must be signed so merchants can authenticate Sparelane as the sender.

## Rationale

Security architecture baseline.

## Acceptance Criteria

- Requirement is reflected in security architecture/docs and ADR bindings.
- Verification planned via security/acceptance tests in product CI (future platform repo).

## Notes

Stored under `requirements/security/` for navigation; type is non-functional.
