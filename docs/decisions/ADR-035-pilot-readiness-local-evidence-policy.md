---
id: ADR-035
title: Pilot Readiness Local Evidence Policy
status: Accepted
date: 2026-08-24
deciders: Architecture
consulted: Product / Security / Privacy / Operations
informed: Platform engineering
supersedes: []
related:
  - ADR-012
  - ADR-016
  - ADR-017
  - ADR-024
  - ADR-025
  - ADR-026
  - ADR-027
  - ADR-028
  - ADR-029
  - ADR-030
  - ADR-031
  - ADR-032
  - ADR-033
  - ADR-034
  - OD-008
  - OD-009
  - OD-010
  - OD-021
  - OD-023
  - OD-024
  - OD-025
  - OD-035
---

# ADR-035 — Pilot Readiness Local Evidence Policy

## Status

**Accepted**

Unblocks **Phase I engineering** for **local Fake-provider pilot readiness evidence** without selecting live PSP/settlement partners, production IdP/MFA vendors, hosted SIEM, or inventing production numeric SLOs / alert thresholds still marked TBD.

Canonical Phase I remains **incomplete** until later slices complete. This ADR does **not** claim MVP complete, pilot money-ready, or production-ready.

See [phase-i-pilot-readiness-decision-gate](../implementation/phase-i-pilot-readiness-decision-gate.md).

## Context

[build-phases](../implementation/build-phases.md) defines **Phase I — Pilot Readiness** after A–H:

> runbooks, alerts, sandbox end-to-end, load/recovery testing, pen-test/security validation, reconciliation testing.

Phases A–H are locally PASS (Fake PSP / Fake settlement / Fake email / Fake-dev admin MFA). Multiple open decisions still block **production money movement** and **live sandbox partners** (OD-008, OD-009, OD-010, OD-023, OD-024, OD-025, OD-035, OD-021, etc.).

Without a binding local-evidence policy, platform would have to invent:

1. whether “sandbox E2E” means live partner sandbox or Fake-provider journey
2. production alert threshold numbers (`alerting.md`: “Exact thresholds TBD”)
3. restore cadence / numeric SLOs (`NFR-OPS-003`: cadence TBD)
4. whether external pen-test execution is required to close Phase I locally
5. whether bank-statement reconciliation is in Phase I scope

## Scope options

| Option | Scope | Verdict |
| --- | --- | --- |
| **A — Local Fake pilot readiness evidence** | Formalise runbooks + alert *catalogue*; Fake-provider A→H E2E harness; FIN-INV consolidation; local recovery drills; automated security regressions + checklist. No live partners. No invented production thresholds. | **Selected** |
| **B — Live sandbox partner readiness** | Requires OD-008/009/023/024/025/035 selections | **Rejected for I0–I3** — blocked by open ODs |
| **C — Production cutover readiness** | Hosted SIEM, pen-test vendor, restore cadence SLOs, live money | **Rejected** — not Phase I local; blocked by ODs |

## Decision summary (binding)

| # | Decision |
| --- | --- |
| 1 | **Phase I local evidence** uses **Fake PSP / Fake settlement / Fake email / Fake-dev admin MFA** only, reusing A–H providers. |
| 2 | **“Sandbox end-to-end” for local Phase I** means a single orchestrated Fake-provider journey covering bill → collect → ledger → settle → webhook → notification → admin inspect paths already bound by ADR-024…034 — **not** live partner sandbox. |
| 3 | **Runbooks** for the five architecture stubs (payment outage, settlement outage, ledger posting failure, DLQ replay, webhook backlog) must be **executable against local Fake evidence** (safe/unsafe actions already bound by prior ADRs). Platform may add Fake-specific check commands; must not invent new financial mutation paths. |
| 4 | **Alert catalogue** is closed for Phase I: the category list in [alerting](../operations/alerting.md) is **binding as signal classes**. Platform must map each class to existing/bounded metrics. **Numeric production thresholds remain TBD** — I0/I1 may document *local CI evaluation hooks* (signal present / depth > 0 style) without claiming production threshold correctness. |
| 5 | **Reconciliation testing** for Phase I = consolidate and re-run **FIN-INV-01…10** (+ related E2E-SET/PAY) under Fake providers. **Bank-statement / ERP matching is out of scope.** |
| 6 | **Load/recovery testing** for Phase I = **crash/restart/duplicate/at-least-once drills** already implied by ADR-016/017/FIN-INV-09/10 — **not** invented TPS/SLO targets. |
| 7 | **Security validation** for Phase I local = **automated security regressions** (tenant isolation, PCI guards, admin authz, webhook SSRF, production fake-auth blocked) + **written readiness checklist**. **External pen-test engagement is deferred** (not required to close local Phase I). |
| 8 | **No new admin capabilities, no financial mutations, no H3+ scope** in Phase I. Phase H controls remain intact. |
| 9 | **No new money CoA, provider finality, retry timings, or grant/replay policy** — reuse ADR-024…034. |
| 10 | Closing local Phase I does **not** resolve OD-008/009/010/021/023/024/025/035 or mark MVP complete. |

## Engineering decomposition (local slices)

| Slice | Purpose | Depends on |
| --- | --- | --- |
| **I0** | Pilot readiness inventory + runbook/alert catalogue alignment + readiness checklist (docs + metric mapping + test harness scaffolding). **No new product domain.** | ADR-035; A–H PASS |
| **I1** | Fake-provider end-to-end pilot journey harness + FIN-INV consolidation suite | I0 |
| **I2** | Local recovery / restart / duplicate drills (worker + outbox + DLQ webhook replay paths) | I1 |
| **I3** | Automated security regression pack + security readiness checklist evidence | I0 (may parallel I1/I2) |
| **Exit** | Phase I architecture/platform evidence gate | I0–I3 |

Engineering slices are **not** separate canonical architecture phases.

## Explicitly out of Phase I local scope

- Live PSP / settlement partner / email vendor / IdP / MFA provider selection
- Hosted SIEM / production alert routing (OD-021)
- Numeric production SLOs, restore cadence, alert thresholds
- External pen-test execution
- Bank-statement reconciliation
- Wallet (OD-004/012)
- H3+ admin mutations (notification replay, lifecycle, corrections, PII search, break-glass)
- Claiming overall MVP acceptance complete

## Consequences

### Positive

- Platform can start I0 without inventing vendor or threshold policy
- Clear Fake vs live boundary for “sandbox E2E”
- FIN-INV remain the financial reconciliation evidence path

### Negative / follow-ups

- Pilot *with merchants on live sandbox rails* still blocked by OD-008/009/023/024/025/035
- Production alerting remains incomplete until thresholds + OD-021 resolved
- External pen-test remains a post–local-Phase-I (or pilot) activity

## Rejected alternatives (summary)

- Inventing production alert thresholds or restore cadences → forbidden by existing TBD notes
- Treating live sandbox as mandatory for Phase I close → blocked by open ODs
- Expanding Phase I into H3+ product admin → contradicts Phase H exit and ADR-032…034

## References

- [build-phases](../implementation/build-phases.md) Phase I
- [mvp-acceptance-criteria](../implementation/mvp-acceptance-criteria.md) Operations section
- [alerting](../operations/alerting.md), [runbooks](../operations/runbooks/README.md)
- [financial-invariant-tests](../implementation/financial-invariant-tests.md)
- NFR-OPS-001…006, NFR-REL-001…006
