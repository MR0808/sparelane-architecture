---
id: FUN-SET-001
title: Ledger confirmation before settlement eligibility
type: functional
area: settlement
status: accepted
priority: must
mvp: true
implementationStatus: implemented
implementationEvidence: sparelane-platform/docs/development/phase-f-requirements.md
architecture:
  - settlementCore
  - fundsLedger
flows:
  - collectionToLedger
  - merchantSettlement
adrs:
  - ADR-005
  - ADR-004
  - ADR-027
  - ADR-037
  - ADR-039
contracts: []
modules:
  - Settlement
  - Ledger
tests:
  - FIN-INV-04
  - E2E-SET-001
designs:
  - SEQ-MONEY-001
  - STATE-MONEY-001
---
# FUN-SET-001 — Ledger confirmation before settlement eligibility

## Requirement

A collection becomes settlement-eligible only after successful ledger posting confirmation. Settlement creation requires `ledger_posting_status = CONFIRMED` and a valid ADR-026 collection journal; eligibility additionally requires merchant status and `APPROVED_FOR_SETTLEMENT` per [ADR-027](../../docs/decisions/ADR-027-settlement-obligation-eligibility-cardinality.md).

Under [ADR-037](../../docs/decisions/ADR-037-collection-funds-flow-merchant-of-record.md) / [ADR-039](../../docs/decisions/ADR-039-mvp-settlement-provider-selection.md), eligibility tracks **provider-mediated** Stripe Connect manual payout of gross amounts from the merchant connected-account balance — not Sparelane custody.

## Rationale

Collection before settlement (ADR-005); obligation/eligibility policy (ADR-027).

## Acceptance Criteria

- No Settlement created without ledger confirmation and valid collection journal.
- No ELIGIBLE without merchant/KYB gates when applicable.
- Failed collection cannot become settlement eligible / create Settlement.
- Cardinality: one Settlement per confirmed PaymentWorkflow (`payment_workflow_id` unique).
- Amount: gross merchant payable CREDIT from collection journal (equals Bill amount).

## Notes

Money movement MVP. F0 creates PENDING then evaluates ELIGIBLE; does not submit bank instructions.

`implementationStatus: implemented` for **local Fake / domain obligation+eligibility** (Phase F). Architecture `status` remains **accepted**. Not real-provider verified. See [phase-f-status](../../docs/implementation/phase-f-status.md).
