---
id: INT-NOT-002
title: SMS notification delivery
type: integration
area: notifications
status: accepted
priority: should
mvp: false
architecture:
  - experienceApi
flows: []
adrs:
  - ADR-019
contracts: []
modules:
  - Notifications
tests: []
---
# INT-NOT-002 — SMS notification delivery

## Requirement

SMS notification providers may be used for consumer alerts; SMS failure must not block payment or settlement processing.

## Rationale

Defines required provider interface capabilities for vendor evaluation. Does not select a vendor.

## Acceptance Criteria

- Capability is expressible as an adapter interface in implementation blueprints.
- Unknown/timeout behaviours have a safe reconciliation path where money movement is involved.

## Notes

Vendors remain open decisions.

**Phase G:** SMS is not MVP (`mvp: false`). Not in G0/G1. [ADR-030](../../docs/decisions/ADR-030-merchant-webhook-contract-signing-and-delivery.md).
