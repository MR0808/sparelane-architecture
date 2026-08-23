# Implementation status

**Status:** Current  
**Owner:** Engineering / Architecture  
**Last Reviewed:** 2026-08-22  
**Related ADRs:** ADR-001–033  

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
| C | Bill Ingestion | **PASS WITH DOCUMENTED NON-BLOCKING RISKS** — [phase-c-status](phase-c-status.md) |
| D | Payment Reliability Engine | **PASS WITH DOCUMENTED NON-BLOCKING RISKS** — [phase-d-status](phase-d-status.md) |
| E | Ledger | **PASS WITH DOCUMENTED NON-BLOCKING RISKS** (E0–E1 engineering slices; collection posting ADR-026) — see [phase-e1-accounting-gate](phase-e1-accounting-gate.md), platform `phase-e0` / `phase-e1` evidence |
| F | Settlement | **PASS WITH DOCUMENTED NON-BLOCKING RISKS** — [phase-f-status](phase-f-status.md) (local Fake settlement; not real-provider / real-money) |
| G | Notifications & Webhooks | **PASS WITH DOCUMENTED NON-BLOCKING RISKS** — [phase-g-status](phase-g-status.md) (local webhook sink + Fake email; OD-025/OD-035 open) |
| H | Security / Admin Hardening | **H0/H1 gates PASS**; **architecture H2 gate PASS** (durable DLQ + webhook replay) — [phase-h0-admin-decision-gate](phase-h0-admin-decision-gate.md), [phase-h1-admin-decision-gate](phase-h1-admin-decision-gate.md), [phase-h2-admin-decision-gate](phase-h2-admin-decision-gate.md), [phase-h-status](phase-h-status.md); platform H0/H1 **PASS** (local); platform H2 **not started**; Phase H still **in progress** |
| I | Pilot Readiness | **NOT STARTED** on platform |

Canonical phase definitions remain in [build-phases](build-phases.md). Do not treat module shells or provider ports as deployed product systems.

## Discovery path

Architecture → [Requirements](../../requirements/README.md) → [Designs](../design/README.md) → [Implementation blueprint](README.md) → **this status** → [Traceability](architecture-traceability.md) → [Tests](../../requirements/test-catalog.md) → [Open decisions](../decisions/open-decisions.md)

Evidence lives in the sibling `sparelane-platform` repository (paths referenced in backticks). This architecture repository does not depend on that tree at build time.
