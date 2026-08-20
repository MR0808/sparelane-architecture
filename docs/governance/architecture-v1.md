# Architecture Portal v1

**Status:** Current  
**Owner:** Architecture (TBD)  
**Last Reviewed:** 2026-08-20  
**Related ADRs:** ADR-001–023 (Accepted)  
**Related Views:** `01 Overview / Architecture Map`

## Declaration

**Architecture Portal v1** (this repository + [architecture.sparelane.co](https://architecture.sparelane.co)) includes:

- Logical architecture (LikeC4)
- Dynamic / sequence flows
- Accepted ADRs (ADR-001–023)
- Physical data design and ERD guidance
- Merchant API OpenAPI contract
- Security and threat model
- Deployment and resilience design
- Implementation blueprint and build phases
- Phase A platform foundation status (not product completeness)
- Phase B merchant + consumer core status (no money movement; not MVP acceptance)
- Operational runbooks
- Operational runbooks
- Governance process (change, checklist, ADR template, review cadence)
- Requirements catalogue with coverage and test specifications
- Client-side global search (Ctrl/Cmd+K, MiniSearch)
- LikeC4 deep links (`/architecture/view/:viewId`)
- Interactive OpenAPI docs (`/contracts/api`, Scalar — documentation only)
- Stable open-decision IDs (`OD-###`) and portal health dashboard

## What v1 does **not** mean

This does **not** mean every technology or vendor decision is final.

[Open decisions](../decisions/open-decisions.md) remain authoritative for unresolved product, provider, regulatory and infrastructure choices. Diagrams tagged `#proposed` are directional, not procurement commitments.

Implementation of the product lives in a separate application repository (`sparelane-platform` per implementation blueprint), guided by — but not replaced by — this portal. Phase A is platform foundation only; see [phase-a-status](../implementation/phase-a-status.md). Phase B is merchant + consumer core only — no money movement; see [phase-b-status](../implementation/phase-b-status.md).
