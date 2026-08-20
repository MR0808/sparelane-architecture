---
id: NFR-SEC-002
title: No raw PAN or CVV storage
type: non-functional
area: security
status: accepted
implementationStatus: foundation_implemented
implementationEvidence: sparelane-platform/docs/development/phase-a-requirements.md
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

## Implementation evidence (Phase A)

`implementationStatus: foundation_implemented`. Redaction keys and PCI contract guards exist; there is no product card vault. Raw PAN/CVV must still never be stored when payments are implemented.

## Notes

Stored under `requirements/security/` for navigation; type is non-functional.
