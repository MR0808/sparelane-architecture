---
id: FUN-PAY-006
title: Scheduled retry
type: functional
area: payments
status: accepted
priority: must
mvp: true
architecture:
  - paymentEngineCore
flows:
  - scheduledRetry
adrs:
  - ADR-002
  - ADR-017
contracts: []
modules:
  - Reliability Engine
  - Workers
tests: []
dependsOn: []
---
# FUN-PAY-006 — Scheduled retry

## Requirement

Sparelane must support scheduled retries for retry-eligible payment failures within bounded policy.

## Rationale

Scheduled retries complement Retry Now and fallback.

## Acceptance Criteria

- Retries are bounded (see NFR-REL-003).
- Scheduled retry does not bypass duplicate-collection protections.

## Notes

Payment Reliability Engine MVP.
