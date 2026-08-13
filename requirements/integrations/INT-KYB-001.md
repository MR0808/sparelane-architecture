---
id: INT-KYB-001
title: Merchant KYC/KYB verification capability
type: integration
area: kyb
status: accepted
priority: must
mvp: true
architecture:
  - merchantIntegration
  - securityArchitecture
flows: []
adrs: []
contracts:
  - docs/integrations/merchant-onboarding.md
modules:
  - Merchant Integrations
  - Risk
tests: []
---
# INT-KYB-001 — Merchant KYC/KYB verification capability

## Requirement

KYC/KYB provider interfaces must support merchant verification outcomes required for onboarding risk controls.

## Rationale

Defines required provider interface capabilities for vendor evaluation. Does not select a vendor.

## Acceptance Criteria

- Capability is expressible as an adapter interface in implementation blueprints.
- Unknown/timeout behaviours have a safe reconciliation path where money movement is involved.

## Notes

Vendors remain open decisions.
