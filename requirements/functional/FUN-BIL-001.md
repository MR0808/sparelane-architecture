---
id: FUN-BIL-001
title: Ingest merchant bill events
type: functional
area: bills
status: accepted
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
tests: []
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
