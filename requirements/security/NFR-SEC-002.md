---
id: NFR-SEC-002
title: No raw PAN or CVV storage
type: non-functional
area: security
status: accepted
implementationStatus: implemented
implementationEvidence: sparelane-platform/docs/development/phase-b-requirements.md
priority: must
mvp: true
architecture:
  - pciBoundaryView
  - trustBoundaries
flows:
  - addPaymentMethod
adrs:
  - ADR-001
  - ADR-010
contracts:
  - docs/security/pci-boundary.md
modules:
  - Payment Methods
  - PSP adapter
tests: []
designs:
  - SEQ-SEC-001
---
# NFR-SEC-002 — No raw PAN or CVV storage

## Requirement

Sparelane must not store or log raw PAN or CVV. Card data is tokenised by the PSP.

## Rationale

Security architecture baseline.

## Acceptance Criteria

- Requirement is reflected in security architecture/docs and ADR bindings.
- Verification planned via security/acceptance tests in product CI (future platform repo).

## Implementation evidence (Phase B)

`implementationStatus: implemented` for the **Phase B slice** only. Architecture `status` remains **accepted**. No PAN/CVV application contracts or persistence; Consumer-owned token references only; provider tokens not exposed on reads. Hosted PSP card entry not implemented (OD-008). See [phase-b-status](../../docs/implementation/phase-b-status.md).

## Notes

Stored under `requirements/security/` for navigation; type is non-functional.
