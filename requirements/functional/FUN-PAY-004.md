---
id: FUN-PAY-004
title: Ordered fallback across backup methods
type: functional
area: payments
status: accepted
priority: must
mvp: true
architecture:
  - paymentEngineCore
flows:
  - backupRecovery
  - paymentRecovery
adrs:
  - ADR-002
contracts: []
modules:
  - Reliability Engine
tests:
  - E2E-PAY-002
dependsOn:
  - FUN-PAY-003
openDecisions:
  - OD-003
designs:
  - SEQ-PAY-004
---
# FUN-PAY-004 — Ordered fallback across backup methods

## Requirement

On eligible primary failure, Sparelane must attempt ordered backup payment methods according to decline classification and policy.

## Rationale

Backup recovery is a core reliability behaviour (BUS-005).

## Acceptance Criteria

- Backup order matches consumer-configured priority.
- Ineligible methods are skipped without counting as successful collection.

## Notes

Payment Reliability Engine MVP.
