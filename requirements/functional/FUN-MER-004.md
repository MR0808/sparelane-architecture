---
id: FUN-MER-004
title: Safely retry duplicate bill request
type: functional
area: merchant
status: accepted
implementationStatus: implemented
priority: must
mvp: true
architecture:
  - merchantIntegration
flows:
  - duplicateBillSubmission
adrs:
  - ADR-008
contracts:
  - contracts/openapi.yaml
modules:
  - Bills
  - API layer
tests:
  - INT-API-001
designs:
  - SEQ-INT-002
---
# FUN-MER-004 — Safely retry duplicate bill request

## Requirement

Merchants must be able to safely retry bill submission requests without creating duplicate bills or duplicate payment workflows.

## Rationale

Idempotent Merchant API (ADR-008) is required for at-least-once client retries.

## Acceptance Criteria

- Duplicate submission with the same idempotency key returns the original result without creating a second bill/workflow.
- Non-idempotent conflicting payloads are rejected safely.

## Notes

MVP merchant integration scope.

`implementationStatus: implemented` for the **Phase C idempotency slice** only. Architecture `status` remains **accepted**. Replay / conflict / concurrent same-key evidence in `sparelane-platform` C2/C4. Retention TTL remains OD-030. Concurrent in-progress losers may receive 503 then retry with the **same** key. See [phase-c-status](../../docs/implementation/phase-c-status.md).
