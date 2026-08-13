---
id: NFR-REL-005
title: No blind retry after unknown financial outcome
type: non-functional
area: reliability
status: accepted
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

## Notes

Numerical SLOs remain TBD where not yet decided.
