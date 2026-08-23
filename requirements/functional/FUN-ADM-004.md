---
id: FUN-ADM-004
title: Read-only audit and security visibility
type: functional
area: admin
status: accepted
implementationStatus: implemented
priority: must
mvp: true
architecture:
  - privilegedAccess
  - securityArchitecture
adrs:
  - ADR-012
  - ADR-032
contracts:
  - docs/security/audit.md
modules:
  - Audit
  - Admin Control Plane
tests:
  - ADM-AUD-001
---
# FUN-ADM-004 — Read-only audit and security visibility

## Requirement

Platform admins with `admin.audit.view` and `admin.security_event.view` may query audit and security-event stores read-only through the admin BFF.

## Rationale

ADR-032; operational transparency without audit mutation or export in H0.

## Acceptance Criteria

- Paginated read-only queries with safe filters only.
- Audit store remains append-only — no update/delete admin APIs.
- Responses apply central redaction — no secrets or raw PII dumps.
- Audit export/SIEM deferred.

## Notes

Routine admin read access is not individually audited in H0 unless future sensitive-access policy requires.

## Implementation notes

implementationStatus: implemented for local H0 read-only admin control plane evidence in sparelane-platform (
pm run test:phase-h0, docs/development/phase-h0-final-status.md). Architecture status remains **accepted**. Production admin MFA remains blocked by OD-024 — not product_verified.
