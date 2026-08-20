---
id: FUN-MER-001
title: Onboard merchant
type: functional
area: merchant
status: accepted
implementationEvidence: sparelane-platform/docs/development/phase-b-requirements.md
priority: must
mvp: true
architecture:
  - merchantIntegration
flows: []
adrs:
  - ADR-007
contracts:
  - docs/integrations/merchant-onboarding.md
modules:
  - Merchant Integrations
tests: []
---
# FUN-MER-001 — Onboard merchant

## Requirement

Sparelane must support merchant onboarding so a merchant can participate in bill submission, webhooks, and settlement.

## Rationale

Onboarding establishes tenant identity and integration configuration.

## Acceptance Criteria

- Onboarded merchants receive credentials/config needed for Merchant API access.
- Merchant tenant boundaries are established at onboarding.

## Notes

MVP merchant integration scope.

## Implementation evidence (Phase B — partial)

Architecture `status` remains **accepted**. Merchant tenant + creator membership exist. No KYB, Merchant API credentials, or webhook config. Initial merchant status `DRAFT` is onboarding convention, not live approval. See [phase-b-status](../../docs/implementation/phase-b-status.md).
