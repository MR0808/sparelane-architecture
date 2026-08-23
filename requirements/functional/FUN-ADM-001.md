---
id: FUN-ADM-001
title: Persisted platform-admin authority
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
  - docs/security/authorisation.md
modules:
  - Identity
tests:
  - ADM-AUTH-001
  - ADM-AUTH-003
---
# FUN-ADM-001 — Persisted platform-admin authority

## Requirement

Platform admin authority must come only from an explicit persisted `PlatformAdminGrant` linked to a `User` resolved via `ExternalIdentity`.

## Rationale

ADR-032; prevents implicit or environment-based admin.

## Acceptance Criteria

- `ExternalIdentity → User → active PlatformAdminGrant → AdminPrincipal` is the canonical chain.
- Merchant membership, consumer profile, email/domain, and environment configuration do not grant platform admin.
- Removing or deactivating the grant removes admin authority on the next request without restart.

## Notes

H0 foundation requirement. Grant management UI deferred H1.

## Implementation notes

implementationStatus: implemented for local H0 read-only admin control plane evidence in sparelane-platform (
pm run test:phase-h0, docs/development/phase-h0-final-status.md). Architecture status remains **accepted**. Production admin MFA remains blocked by OD-024 — not product_verified.
