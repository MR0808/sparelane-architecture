# Implementation status

**Status:** Current  
**Owner:** Engineering / Architecture  
**Last Reviewed:** 2026-08-20  
**Related ADRs:** ADR-001–023  
**Related Views:** `10 Implementation /*`

Tracks how far `sparelane-platform` has progressed against this architecture. **This is not a product completeness percentage.** Architecture Accepted does not mean the product is built.

## Vocabulary

Keep four distinct layers. Do not collapse them.

| Layer | Meaning |
| --- | --- |
| **Designed** | Architecture/requirement is Accepted (or otherwise approved). No platform implementation claim. |
| **Foundation implemented** | Cross-cutting platform infrastructure exists and has evidence. Product behaviour is **not** claimed. |
| **Implemented** | Product capability is believed present in platform code. |
| **Verified** | Product behaviour has been demonstrated against architecture tests/acceptance criteria. |

Requirement markdown uses:

- `status` — architecture/requirement lifecycle (`accepted`, `implemented`, `verified`, …). **Do not** set `implemented` merely because a foundation exists.
- `implementationStatus` (optional) — `designed` \| `foundation_implemented` \| `implemented` \| `verified`. Omitted means **designed**.

Test specifications keep `status: specified` until a product test is executable. Optional `implementationProgress: foundation_prerequisite` records infrastructure evidence without claiming financial/product E2E verification.

## Current platform phases

| Phase | Architecture name | Platform status |
| --- | --- | --- |
| A | Platform Foundation | **PASS WITH DOCUMENTED NON-BLOCKING RISKS** — [phase-a-status](phase-a-status.md) |
| B | Merchant + Consumer Core | **PASS WITH DOCUMENTED NON-BLOCKING RISKS** — [phase-b-status](phase-b-status.md) |
| C–I | Bill through pilot readiness | **NOT STARTED** |

Canonical phase definitions remain in [build-phases](build-phases.md). Do not treat module shells or provider ports as deployed product systems.

## Discovery path

Architecture → [Requirements](../../requirements/README.md) → [Designs](../design/README.md) → [Implementation blueprint](README.md) → **this status** → [Traceability](architecture-traceability.md) → [Tests](../../requirements/test-catalog.md) → [Open decisions](../decisions/open-decisions.md)

Evidence lives in the sibling `sparelane-platform` repository (paths referenced in backticks). This architecture repository does not depend on that tree at build time.
