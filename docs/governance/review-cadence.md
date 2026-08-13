# Architecture Review Cadence

**Status:** Current  
**Owner:** Architecture (TBD)  
**Last Reviewed:** 2026-08-13  

Conceptual review categories. Exact calendar dates are TBD.

## Event-driven review

Triggered by a material architecture change (see [change process](architecture-change-process.md)). Scope = the change + checklist.

## Pre-pilot review

Before external merchant pilot. Confirm:

- Accepted ADRs still hold for pilot scope
- Open decisions that block pilot are resolved or explicitly waived
- Sandbox contracts, webhooks, and runbooks adequate
- Financial invariant tests defined for pilot paths

## Pre-production review

Before real money movement. Confirm:

- PSP + settlement partner selected and adapter contracts ready
- Secrets, IdP/MFA, broker/DB topology decided for production
- PCI validation approach understood
- Settlement unknown-outcome and DLQ runbooks exercised
- Traceability: ADR → implementation → tests covered for go-live scope

## Periodic architecture review

Recommended on a recurring cadence (interval TBD) to:

- Re-scan open decisions
- Check portal link health (`npm run docs:links`)
- Confirm diagrams still match Accepted ADRs
- Retire stale `#proposed` items that were decided elsewhere
