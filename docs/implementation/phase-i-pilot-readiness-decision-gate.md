# Phase I — Pilot Readiness decision gate (architecture)

**Status:** **PASS** — binding local-evidence policy in [ADR-035](../decisions/ADR-035-pilot-readiness-local-evidence-policy.md)

**Platform:** **PASS WITH DOCUMENTED NON-BLOCKING RISKS** — I0–I3 complete (`npm run test:phase-i`; see [phase-i-status](./phase-i-status.md)).

Canonical Phase H is **PASS WITH DOCUMENTED NON-BLOCKING RISKS**. Canonical next phase is **Phase I — Pilot Readiness** per [build-phases](./build-phases.md).

## Why a gate was required

Phase I deliverables (runbooks, alerts, sandbox E2E, load/recovery, security validation, reconciliation) are **operational**, not a new money domain. Without a binding policy, platform would invent:

| Ambiguity | Risk if invented |
| --- | --- |
| Sandbox E2E = live partner vs Fake journey | Blocked by OD-008/009 or silent Fake-as-live claim |
| Alert threshold numbers | Contradicts `alerting.md` TBD |
| Restore cadence / load TPS | Contradicts NFR-OPS-003 TBD |
| External pen-test required to close Phase I | Unbound vendor/schedule |
| Bank-statement reconciliation | Unbound accounting/product scope |

## Gap audit (canonical Phase I capabilities)

| Capability | Classification | Notes |
| --- | --- | --- |
| Runbook topics + safe/unsafe actions | **BINDING** (prior ADRs + runbook stubs) | Payment/settlement/ledger/DLQ/webhook stubs exist |
| Alert *categories* | **BINDING** | Listed in alerting.md |
| Alert *numeric thresholds* | **OPEN / TBD** | Not required for local I0; must not invent for production |
| Fake-provider A→H journey | **BINDING** (reuse A–H ADRs) | ADR-035 defines this as local “sandbox E2E” |
| Live partner sandbox E2E | **OPEN DECISION** | OD-008/009/023/024/025/035 — **out of local Phase I** |
| FIN-INV reconciliation suite | **BINDING** | ADR-035 maps Phase I reconciliation → FIN-INV |
| Bank-statement reconciliation | **OPEN / out of scope** | Not designed |
| Crash/restart/duplicate recovery drills | **BINDING** (ADR-016/017 + FIN-INV-09/10) | No new TPS SLOs |
| Production SIEM routing | **OPEN** (OD-021) | Out of local Phase I |
| External pen-test execution | **DESIGNED BUT INCOMPLETE** | Checklist + automated regressions bound; engagement deferred |
| Admin / money policy changes | **IMPLEMENTATION DETAIL ONLY / forbidden** | No H3+; no CoA changes |

## Hard gate result

| # | Requirement | Result |
| --- | --- | --- |
| 1 | Next canonical phase identified from SoT | **BOUND** — Phase I Pilot Readiness |
| 2 | Local vs live sandbox meaning | **BOUND** — Fake-provider journey (ADR-035) |
| 3 | Runbook scope | **BOUND** — five architecture runbooks; Fake-executable checks only |
| 4 | Alert catalogue | **BOUND** — categories; thresholds remain TBD |
| 5 | Reconciliation | **BOUND** — FIN-INV consolidation; no bank files |
| 6 | Load/recovery | **BOUND** — restart/duplicate drills; no invented TPS |
| 7 | Security validation | **BOUND** — automated regressions + checklist; external pen-test deferred |
| 8 | No new financial/admin product policy | **BOUND** |
| 9 | Production money ODs remain open | **BOUND** — do not claim resolved |
| 10 | Engineering slices I0–I3 + exit | **BOUND** |

## Selected option

**Option A — Local Fake pilot readiness evidence** (ADR-035).

Rejected: live partner sandbox readiness; production cutover readiness.

## Engineering decomposition

| Slice | Scope | Platform start? |
| --- | --- | --- |
| **I0** | Inventory + runbook/alert catalogue alignment + readiness checklist + harness scaffolding | **Yes — first slice** |
| **I1** | Fake E2E pilot journey + FIN-INV consolidation | After I0 |
| **I2** | Recovery/restart/duplicate drills | After I1 |
| **I3** | Security regression pack + checklist evidence | After I0 (may parallel) |
| **Exit** | Phase I local evidence gate | After I0–I3 |

## I0 — first platform slice (architecture-bound)

### Purpose

Prove Phase I starts with **operational readiness scaffolding** — not new product domain — by publishing a pilot readiness inventory, aligning runbooks/alert catalogue to existing metrics, and scaffolding the Fake E2E/FIN-INV harness entrypoints **without** executing full I1 journeys yet if deferred, or with minimal smoke if architecture allows.

### In scope

1. Platform docs: Phase I readiness inventory mapping A–H evidence → Phase I checklist items
2. Align architecture runbook stubs with platform operator docs (Fake-local check commands only)
3. Closed alert-signal catalogue mapping (category → metric name(s) already emitted); **no production threshold invention**
4. Test scaffolding: `test:phase-i0` / architecture boundary tests that assert catalogue completeness and forbid live-provider claims
5. Explicit non-claims: not MVP complete; not live sandbox; not production MFA; H3+ unchanged

### Out of scope

- Full Fake A→H E2E harness completion (I1)
- Load generators / TPS targets (never invent)
- Live PSP/settlement/email/IdP
- Hosted alerting/SIEM
- External pen-test
- Schema/API product changes
- New admin capabilities
- Financial corrections / notification replay
- Changing FIN-INV semantics

### Domain ownership

Operations / platform engineering. **No new aggregate ownership.**

### State model / schema / money

**None.**

### APIs / workers / events

**None required for I0.** May read existing health/metrics endpoints if present.

### Idempotency / concurrency

N/A beyond existing systems.

### Security / privacy

Preserve Phase H boundaries. No new admin bypass. No PII in readiness docs beyond existing redaction rules.

### Audit / observability

Document alert-signal map; do not invent high-cardinality labels.

### Financial invariants

I0 does **not** newly verify FIN-INV. I1 consolidates verification evidence. Do not mark `product_verified` in I0.

### Tests (architecture-specified)

- `OPS-PILOT-001` — Phase I local scope / Fake-only boundary
- `OPS-ALERT-001` — alert catalogue maps to known metric classes without threshold invention
- `OPS-RUN-001` — required runbooks present and reference safe/unsafe actions

### I0 exit gate

- ADR-035 reflected in platform Phase I0 docs
- Alert catalogue mapping committed
- Runbook alignment docs committed
- `npm run test:phase-i0` green
- No live-provider or production-threshold claims
- Architecture validate still green

### Handoff to I1

I1 implements Fake-provider end-to-end pilot journey harness + FIN-INV consolidation suite per ADR-035.

## Still open (do not resolve in Phase I local)

| OD | Blocks |
| --- | --- |
| OD-008 / OD-009 | Live sandbox / production money |
| OD-010 | Pilot provider capability matrix for live rails |
| OD-023 / OD-024 | Production IdP + admin MFA |
| OD-025 | Production secrets/KMS |
| OD-035 | Production email |
| OD-021 | SIEM / hosted observability |
| Alert numeric thresholds | Production alerting |
| External pen-test | Post-local security assurance |
| OD-014 restore cadence | Production DR |

## Gate verdict

**Architecture gate: PASS** for **I0** under ADR-035 Option A.

Platform Phase I remains **NOT STARTED** until I0 implementation begins.
