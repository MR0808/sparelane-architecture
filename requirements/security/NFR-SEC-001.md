---
id: NFR-SEC-001
title: Merchant tenant isolation
type: non-functional
area: security
status: accepted
implementationStatus: implemented
implementationEvidence: sparelane-platform/docs/development/phase-b-requirements.md
priority: must
mvp: true
architecture:
  - trustBoundaries
  - dataArchitecture
flows: []
adrs:
  - ADR-014
contracts:
  - docs/data/tenant-isolation.md
modules:
  - All merchant-scoped modules
tests:
  - FIN-INV-08
  - SEC-TEN-001
---
# NFR-SEC-001 — Merchant tenant isolation

## Requirement

Sparelane must enforce merchant tenant isolation so one merchant cannot read or mutate another merchant's data.

## Rationale

ADR-014; FIN-INV-08.

## Acceptance Criteria

- Requirement is reflected in security architecture/docs and ADR bindings.
- Verification planned via security/acceptance tests in product CI (future platform repo).

## Implementation evidence (Phase B)

`implementationStatus: implemented` for the **Phase B slice** only. Architecture `status` remains **accepted**. Cross-merchant connection/resource isolation with 404 deny convention demonstrated in B6 (`tests/e2e/phase-b/`). SEC-TEN-001 remains `specified` — not `product_verified`. Full MVP tenant-isolation E2E still future work. See [phase-b-status](../../docs/implementation/phase-b-status.md).

## Notes

Stored under `requirements/security/` for navigation; type is non-functional.
