---
id: NFR-SEC-008
title: Platform admin authority separation
type: non-functional
area: security
status: accepted
implementationStatus: implemented
priority: must
mvp: true
architecture:
  - privilegedAccess
  - trustBoundaries
adrs:
  - ADR-014
  - ADR-032
contracts:
  - docs/security/authorisation.md
  - docs/security/admin-access.md
modules:
  - Identity
  - Admin Control Plane
tests:
  - ADM-AUTH-002
  - ADM-AUTH-003
---
# NFR-SEC-008 — Platform admin authority separation

## Requirement

Platform admin authority must remain strictly separate from merchant admin, consumer authority, and machine API credential scopes.

## Rationale

ADR-032 + ADR-014; prevents tenant spoofing and privilege confusion.

## Acceptance Criteria

- Merchant admin with valid membership cannot access admin control-plane routes.
- Platform admin does not automatically gain merchant membership or consumer `/me` authority.
- Cross-tenant admin reads use explicit admin read ports — not merchant context impersonation.

## Notes

Future support/risk roles remain TBD and are not part of H0.

## Implementation notes

Local H0 evidence in sparelane-platform (
pm run test:phase-h0). Not production MFA/product_verified (OD-024).
