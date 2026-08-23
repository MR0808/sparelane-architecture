---
id: FUN-ADM-003
title: Read-only operational object inspection
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
  - ADR-020
contracts:
  - docs/security/admin-access.md
modules:
  - Admin Control Plane
tests:
  - ADM-DATA-001
  - ADM-DATA-002
  - ADM-FIN-001
---
# FUN-ADM-003 — Read-only operational object inspection

## Requirement

Platform admins with appropriate read capabilities may inspect operational objects via exact public-ID lookup and safe bounded projections only.

## Rationale

ADR-032 H0 scope; supports support/security inspection without DB browser or PII search.

## Acceptance Criteria

- Closed H0 read capabilities enforced deny-by-default.
- Merchant, consumer, bill, payment workflow, and settlement lookups require exact public IDs.
- Responses exclude secrets, provider tokens, bank/payout refs, and auth subjects.
- No admin mutation endpoints in H0.

## Notes

Ledger inspection and DLQ UI deferred. See ADR-032 capability catalogue.

## Implementation notes

implementationStatus: implemented for local H0 read-only admin control plane evidence in sparelane-platform (
pm run test:phase-h0, docs/development/phase-h0-final-status.md). Architecture status remains **accepted**. Production admin MFA remains blocked by OD-024 — not product_verified.
