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
  - ADR-027
contracts:
  - contracts/openapi.yaml
modules:
  - Settlement
tests:
  - FIN-INV-05
  - E2E-SET-001
openDecisions:
  - OD-009
  - OD-011
designs:
  - SEQ-MONEY-002
---
# FUN-SET-002 — Submit settlement idempotently

## Requirement

Settlement instructions must be submitted idempotently so the same instruction identity cannot be paid out twice. Domain prerequisite: at most one Settlement obligation per confirmed collection ([ADR-027](../../docs/decisions/ADR-027-settlement-obligation-eligibility-cardinality.md)); instruction exactly-once is a later (post-F0) concern.

## Rationale

FIN-INV-05: settlement cannot be submitted twice for the same instruction identity. ADR-027 freezes one Settlement domain obligation per workflow.

## Acceptance Criteria

- Replay of settlement submission is idempotent.
- Duplicate settlement instruction is rejected or returns original outcome.
- Duplicate `LedgerPostingConfirmed` does not create a second Settlement for the same workflow.

## Notes

Money movement MVP. F0 proves obligation uniqueness; instruction submission is post-F0.
