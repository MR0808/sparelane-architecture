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
  - ADR-030
contracts:
  - docs/security/webhook-security.md
  - docs/contracts/webhook-signing.md
modules:
  - Webhooks
tests:
  - CON-WEBHOOK-001
  - E2E-WEB-001
designs:
  - SEQ-INT-003
  - SEQ-INT-004
---
# NFR-SEC-005 — Signed merchant webhooks

## Requirement

Outbound merchant webhooks must be signed so merchants can authenticate Sparelane as the sender.

## Rationale

Security architecture baseline.

## Acceptance Criteria

- HMAC-SHA256 signing package is documented and testable (ADR-030).
- Signing secrets are never logged; shown once at issuance.
- Outbound webhook destinations cannot target loopback/private/metadata ranges in sandbox/production.
- Verification planned via security/acceptance tests in product CI (future platform G0/G1).

## Notes

Stored under `requirements/security/` for navigation; type is non-functional.
