---
id: FUN-SET-002
title: Submit settlement idempotently
type: functional
area: settlement
status: accepted
priority: must
mvp: true
implementationStatus: implemented
implementationEvidence: sparelane-platform/docs/development/phase-f-requirements.md
architecture:
  - settlementCore
flows:
  - merchantSettlement
  - settlementConfirmation
adrs:
  - ADR-006
  - ADR-027
  - ADR-028
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

Settlement instructions must be submitted idempotently so the same instruction identity cannot be paid out twice.

Binding ([ADR-028](../../docs/decisions/ADR-028-settlement-execution-payout-destination-instruction-idempotency.md)):

- At most one active SettlementInstruction per Settlement
- External idempotency key = `settlement-instruction:{settlementPublicId}`
- Technical retries reuse the same instruction and key
- Default verified MerchantPayoutDestination (merchant + currency) required before submit
- Provider `accepted` → Settlement SUBMITTED — **not** SETTLED
- No MVP SettlementBatch path

Domain prerequisite: at most one Settlement obligation per confirmed collection ([ADR-027](../../docs/decisions/ADR-027-settlement-obligation-eligibility-cardinality.md)).

## Rationale

FIN-INV-05; ADR-027 obligation uniqueness; ADR-028 instruction execution.

## Acceptance Criteria

- Replay of settlement submission is idempotent (same instruction / key).
- Duplicate settlement instruction create is rejected or returns original.
- Concurrent execute yields one logical Fake/provider transfer under the same key.
- Crash after provider accepted recovers via lookup — no second transfer.
- Duplicate `LedgerPostingConfirmed` does not create a second Settlement for the same workflow.
- Provider acknowledgement alone does not mark SETTLED.

## Notes

Money movement MVP. F1 ends at SUBMITTED with FakeSettlementProvider locally. OD-011 cadence does not apply to F1 (no batching).

`implementationStatus: implemented` for **local Fake instruction idempotency**. OD-009 production partner open. Not real-bank exactly-once. Architecture `status` remains **accepted**. See [phase-f-status](../../docs/implementation/phase-f-status.md).
