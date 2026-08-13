---
id: FUN-SET-002
title: Submit settlement idempotently
type: functional
area: settlement
status: accepted
priority: must
mvp: true
architecture:
  - settlementCore
flows:
  - merchantSettlement
  - settlementConfirmation
adrs:
  - ADR-006
contracts:
  - contracts/openapi.yaml
modules:
  - Settlement
tests:
  - FIN-INV-05
---
# FUN-SET-002 — Submit settlement idempotently

## Requirement

Settlement instructions must be submitted idempotently so the same instruction identity cannot be paid out twice.

## Rationale

FIN-INV-05: settlement cannot be submitted twice for the same instruction identity.

## Acceptance Criteria

- Replay of settlement submission is idempotent.
- Duplicate settlement instruction is rejected or returns original outcome.

## Notes

Money movement MVP.
