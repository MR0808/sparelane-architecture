---
id: FUN-BIL-001
title: Ingest merchant bill events
type: functional
area: bills
status: accepted
implementationStatus: implemented
priority: must
mvp: true
architecture:
  - paymentEngineCore
  - merchantIntegration
flows:
  - billIngestion
  - billSubmission
adrs:
  - ADR-007
contracts:
  - contracts/openapi.yaml
modules:
  - Bills
tests:
  - INT-API-001
designs:
  - SEQ-PAY-001
  - SEQ-INT-001
---
# FUN-BIL-001 — Ingest merchant bill events

## Requirement

Sparelane must ingest merchant bill events into operational bill records that drive payment scheduling and orchestration.

## Rationale

Bill Management owns ingestion and scheduling against due dates.

## Acceptance Criteria

- Ingested bills are durable in the operational store.
- Invalid bill payloads are rejected without partial orchestration side effects.

## Notes

Merchants remain billing SoR (BUS-002).

`implementationStatus: implemented` for the **Phase C bill ingestion slice** only. Architecture `status` remains **accepted**. Durable Bill + 1:1 PaymentWorkflow + BillAccepted outbox demonstrated in `sparelane-platform` (C1–C4). Scheduling against due dates is FUN-BIL-002 / Phase D. See [phase-c-status](../../docs/implementation/phase-c-status.md).
