---
id: FUN-ADM-002
title: Admin-only control-plane access
type: functional
area: admin
status: accepted
implementationStatus: implemented
priority: must
mvp: true
architecture:
  - privilegedAccess
adrs:
  - ADR-032
contracts:
  - docs/security/admin-access.md
  - docs/security/api-security.md
modules:
  - Identity
  - Admin Control Plane
tests:
  - ADM-AUTH-001
  - ADM-AUTH-002
---
# FUN-ADM-002 — Admin-only control-plane access

## Requirement

Administrative control-plane routes (`/admin` UI and `/admin/v1/*` BFF) must be accessible only to principals with active platform-admin authority.

## Rationale

ADR-032; separates admin control plane from merchant portal and public Merchant API.

## Acceptance Criteria

- Every admin route is protected server-side by persisted grant resolution.
- Anonymous, consumer, merchant user, and merchant machine credential requests are denied.
- Merchant `/v1` routes do not expose platform-admin operations.

## Notes

Frontend route hiding is not authorisation.

## Implementation notes

implementationStatus: implemented for local H0 read-only admin control plane evidence in sparelane-platform (
pm run test:phase-h0, docs/development/phase-h0-final-status.md). Architecture status remains **accepted**. Production admin MFA remains blocked by OD-024 — not product_verified.
