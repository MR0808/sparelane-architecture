---
id: NFR-PRIV-005
title: Admin control plane data minimisation
type: non-functional
area: privacy
status: accepted
implementationStatus: implemented
priority: must
mvp: true
architecture:
  - dataClassification
  - privilegedAccess
adrs:
  - ADR-032
contracts:
  - docs/security/data-classification.md
  - docs/data/privacy-design.md
modules:
  - Admin Control Plane
tests:
  - ADM-DATA-001
  - ADM-DATA-002
---
# NFR-PRIV-005 — Admin control plane data minimisation

## Requirement

Admin control-plane views must expose only data necessary for operational and security inspection, using safe public identifiers and bounded metadata.

## Rationale

ADR-032; admin must not become unrestricted PII/secret browser.

## Acceptance Criteria

- H0 forbids email, auth-subject, and fuzzy search lookups.
- Admin responses exclude API secrets, webhook signing secrets, provider tokens, and bank/payout destination references.
- Consumer contact email and auth email are not shown in H0 admin views unless a future gated capability explicitly permits it.

## Notes

Stored under requirements/non-functional navigation; complements NFR-PRIV-001.

## Implementation notes

Local H0 evidence in sparelane-platform (
pm run test:phase-h0). Not production MFA/product_verified (OD-024).
