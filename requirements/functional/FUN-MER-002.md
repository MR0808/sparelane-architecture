---
id: FUN-MER-002
title: Configure merchant integration
type: functional
area: merchant
status: accepted
priority: must
mvp: true
architecture:
  - merchantIntegration
flows: []
adrs:
  - ADR-008
  - ADR-009
contracts:
  - docs/integrations/merchant-api.md
modules:
  - Merchant Integrations
  - Webhooks
tests: []
---
# FUN-MER-002 — Configure merchant integration

## Requirement

Merchants must be able to configure integration settings required for API access and webhook delivery endpoints.

## Rationale

Configuration is prerequisite to reliable bill ingestion and outcome delivery.

## Acceptance Criteria

- Webhook endpoint and signing configuration can be set for the merchant.
- API credentials are merchant-scoped.

## Notes

MVP merchant integration scope.
