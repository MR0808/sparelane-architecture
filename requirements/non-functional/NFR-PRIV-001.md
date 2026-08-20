---
id: NFR-PRIV-001
title: Data minimisation
type: non-functional
area: privacy
status: accepted
implementationStatus: implemented
implementationEvidence: sparelane-platform/docs/development/phase-b-requirements.md
priority: must
mvp: true
architecture:
  - dataClassification
  - dataArchitecture
flows: []
adrs: []
contracts:
  - docs/security/data-classification.md
modules:
  - Data Layer
tests: []
---
# NFR-PRIV-001 — Data minimisation

## Requirement

Sparelane must collect and retain only personal data necessary for payment reliability, settlement, and compliance purposes.

## Rationale

Privacy and financial auditability must coexist.

## Acceptance Criteria

- Privacy handling is documented relative to ledger immutability.
- Logs/classification docs forbid CHD in logs.

## Implementation evidence (Phase B)

`implementationStatus: implemented` for the **Phase B slice** only. Architecture `status` remains **accepted**. Portal, audit, and outbox payloads minimised — no provider tokens or unnecessary PII in Phase B events. Retention/deletion workflows not implemented. See [phase-b-status](../../docs/implementation/phase-b-status.md).
