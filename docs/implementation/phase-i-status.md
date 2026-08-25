# Phase I — Pilot Readiness (architecture status)

**Canonical Phase I status:** **PASS WITH DOCUMENTED NON-BLOCKING RISKS**

**Architecture gate:** [phase-i-pilot-readiness-decision-gate](./phase-i-pilot-readiness-decision-gate.md) — **PASS** ([ADR-035](../decisions/ADR-035-pilot-readiness-local-evidence-policy.md))

**Platform I0 status:** **PASS** — inventory + runbooks + alerts (`npm run test:phase-i0`; `sparelane-platform/docs/development/phase-i0-final-status.md`).

**Platform I1 status:** **PASS** — Fake A→H E2E + FIN-INV consolidation (`npm run test:phase-i1`; `sparelane-platform/docs/development/phase-i1-final-status.md`).

**Platform I2 status:** **PASS** — recovery/restart/bounded load drills (`npm run test:phase-i2`; `sparelane-platform/docs/development/phase-i2-final-status.md`).

**Platform I3 status:** **PASS** — security validation pack (`npm run test:phase-i3`; `sparelane-platform/docs/development/phase-i3-final-status.md`).

**Consolidated platform evidence:** `npm run test:phase-i` — `sparelane-platform/docs/development/phase-i-final-status.md`.

## Canonical scope (build-phases)

Phase I delivers runbooks, alerts, sandbox end-to-end, load/recovery testing, security validation, and reconciliation testing. Under **ADR-035 Option A**, local closure uses **Fake-provider evidence only**. Live partner sandbox, production IdP/MFA, hosted SIEM, numeric production thresholds, external pen-test execution, and bank-statement reconciliation remain **documented non-blocking risks** — not blockers to local Phase I closure.

Phase I is the **last canonical build phase** in [build-phases](./build-phases.md). There is no Phase J.

## Engineering decomposition

| Slice | Scope | Platform status |
| --- | --- | --- |
| **I0** | Inventory + runbook/alert catalogue + checklist | **PASS** |
| **I1** | Fake E2E pilot journey + FIN-INV consolidation | **PASS** |
| **I2** | Recovery/restart/duplicate drills + bounded load | **PASS** |
| **I3** | Security regressions + checklist evidence | **PASS** |
| **Exit** | Phase I local evidence gate | **PASS** |

## What Phase I proves locally (ADR-035)

- Five runbooks executable against Fake/local checks with safe/unsafe actions
- Alert category catalogue mapped to existing metrics; thresholds TBD; hosted alerts not configured
- Single orchestrated Fake A→H journey (bill → collect → ledger → settle → webhook → notification → admin inspect)
- FIN-INV-01…10 consolidated under Fake providers; **none** `product_verified`
- Crash/restart/duplicate recovery drills; `LOCAL_BOUNDED_STRESS` load evidence only
- Automated security regressions + pen-test readiness checklist (engagement deferred)
- Payment UNKNOWN + settlement reconcile/finality under Fake — not bank-statement reconciliation

## What Phase I does NOT prove (non-blocking / external)

| Item | Classification |
| --- | --- |
| Live PSP / settlement partner (OD-008/009/010/023) | **Production / live-sandbox blocker** |
| Production IdP / admin MFA (OD-024) | **Production blocker** |
| Production secret manager / email (OD-025/035) | **Production blocker** |
| Hosted SIEM / paging (OD-021) | **Production ops blocker** |
| Production alert numeric thresholds | **TBD — not invented** |
| External penetration test execution | **Deferred** — checklist only |
| PCI / SOC certification | **Not claimed** |
| Bank-statement / ERP reconciliation | **Future enhancement** |
| FIN-INV-07 compensating corrections | **VERIFIED_LOCAL_FAKE** (Track 1C + 1E) — not product_verified |
| FIN-INV-08–10 | **VERIFIED_LOCAL_FAKE** (Track 1A) — not product_verified |
| Production capacity / TPS / SLO / HA | **Not certified** |
| Overall MVP acceptance | **Not complete** — next gate |

## Phase I risk register

| Risk | Local | Pilot | Production |
| --- | --- | --- | --- |
| Fake PSP vs live PSP idempotency | Documented | Blocker | Blocker |
| Fake settlement vs live rail | Documented | Blocker | Blocker |
| Production IdP/MFA | N/A | Partial | Blocker |
| Production secret manager | N/A | Partial | Blocker |
| Production email provider | N/A | Blocker | Blocker |
| External pen test | Deferred | Recommended | Required |
| PCI/compliance validation | N/A | N/A | Blocker |
| SIEM/hosted alerts | N/A | Blocker | Blocker |
| Production thresholds | N/A | TBD | Blocker |
| Bank reconciliation | Out of scope | Future | Future |
| FIN-INV-07 | VERIFIED_LOCAL_FAKE | N/A | Closed local; live N/A for accounting-only correction |
| FIN-INV-08–10 | VERIFIED_LOCAL_FAKE | Partial | Local Fake ≠ product_verified |
| Bounded load ≠ capacity | Documented | N/A | N/A |
| Prisma/deepmerge npm audit advisory | Advisory | Advisory | Advisory |

## Open decisions (not closed by Phase I)

| OD | Classification |
| --- | --- |
| OD-008 PSP selection | Production / live-sandbox blocker |
| OD-009 Settlement partner | Production / live-sandbox blocker |
| OD-010 Settlement capability | Production blocker |
| OD-021 Observability/SIEM | Production ops blocker; non-blocking for local Phase I |
| OD-023 Identity provider | Pilot / production blocker |
| OD-024 MFA/passkey | Production admin blocker; non-blocking for local Phase I |
| OD-025 Secrets/KMS | Production blocker; non-blocking for local Phase I |
| OD-035 Email provider | Pilot / production blocker |

## Traceability

ADR-035 → I0 (OPS-PILOT/ALERT/RUN) → I1 (E2E-PILOT-001, FIN-INV) → I2 (recovery) → I3 (security) → exit gate → [phase-i-final-status](https://github.com/sparelane/sparelane-platform/blob/main/docs/development/phase-i-final-status.md) (platform).

## Next canonical activity

**MVP acceptance gate** — **NOT ACCEPTED — EXTERNAL BLOCKERS** (**4**: OD-008/009/023/025) per [mvp-acceptance-gap-plan](./mvp-acceptance-gap-plan.md). Tracks 1A–1F closed; FIN-INV-01…10 `VERIFIED_LOCAL_FAKE`. **Next = Track 2 OD-008 PSP decision gate**.

## Prior phase

**Phase H — PASS WITH DOCUMENTED NON-BLOCKING RISKS** — [phase-h-status](./phase-h-status.md).
