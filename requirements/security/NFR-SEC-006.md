---
id: NFR-SEC-006
title: Verify provider webhooks
type: non-functional
area: security
status: accepted
priority: must
mvp: true
architecture:
  - trustBoundaries
  - pciBoundaryView
flows:
  - providerWebhookVerification
adrs:
  - ADR-010
contracts:
  - docs/security/webhook-security.md
modules:
  - PSP adapter
  - Integrations
tests: []
---
# NFR-SEC-006 — Verify provider webhooks

## Requirement

Inbound provider webhooks must be authenticated/verified before affecting payment or settlement state.

## Rationale

Security architecture baseline.

## Acceptance Criteria

- Requirement is reflected in security architecture/docs and ADR bindings.
- Verification planned via security/acceptance tests in product CI (future platform repo).

## Notes

Stored under `requirements/security/` for navigation; type is non-functional.
