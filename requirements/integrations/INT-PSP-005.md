---
id: INT-PSP-005
title: Authenticated provider webhooks
type: integration
area: psp
status: accepted
priority: must
mvp: true
architecture:
  - trustBoundaries
flows:
  - providerWebhookVerification
adrs:
  - ADR-010
contracts:
  - docs/security/webhook-security.md
modules:
  - PSP adapter
tests: []
---
# INT-PSP-005 — Authenticated provider webhooks

## Requirement

The PSP interface must provide signed or otherwise authenticated webhooks for payment outcome updates.

## Rationale

Defines required provider interface capabilities for vendor evaluation. Does not select a vendor.

## Acceptance Criteria

- Capability is expressible as an adapter interface in implementation blueprints.
- Unknown/timeout behaviours have a safe reconciliation path where money movement is involved.

## Notes

Vendors remain open decisions.
