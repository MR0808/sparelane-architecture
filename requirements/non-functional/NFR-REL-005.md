---
id: NFR-REL-005
title: No blind retry after unknown financial outcome
type: non-functional
area: reliability
status: accepted
implementationStatus: foundation_implemented
implementationEvidence: sparelane-platform/docs/development/phase-a-requirements.md
priority: must
mvp: true
architecture:
  - paymentEngineCore
  - settlementCore
flows:
  - paymentProviderTimeout
  - unknownSettlementOutcome
adrs:
  - ADR-016
  - ADR-006
contracts: []
modules:
  - Payment Workflows
  - Settlement
tests:
  - FIN-INV-06
designs:
  - SEQ-MONEY-005
  - SEQ-OPS-001
---
# NFR-REL-005 — No blind retry after unknown financial outcome

## Requirement

After an unknown financial provider outcome, Sparelane must reconcile status before retrying money-moving operations.

## Rationale

Reliability patterns from ADR-016/017 and financial invariants.

## Acceptance Criteria

- Behaviour is covered by financial invariant tests and/or resilience docs.
- Runbooks exist for operator response where applicable.

## Implementation evidence (Phase A)

`implementationStatus: foundation_implemented`. Unknown **external** outcome handling was shown on a non-financial provider port. FIN-INV-06 and product PSP/settlement unknown-outcome flows are **not** verified.
