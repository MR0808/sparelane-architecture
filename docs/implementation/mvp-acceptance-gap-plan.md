# MVP acceptance gap plan

**Gate result:** **MVP ACCEPTANCE: NOT ACCEPTED — EXTERNAL BLOCKERS**  
**Date:** 2026-08-25 (Track 1F evidence alignment)  
**Evidence:** `sparelane-platform` Track 1A–1E docs; architecture Phase A–I local Fake complete  
**FIN-INV-07 decision:** [phase-fin-inv-07-decision-gate](./phase-fin-inv-07-decision-gate.md) — **PASS** ([ADR-036](../decisions/ADR-036-financial-compensating-correction-policy.md))  
**FIN-INV-07 verification:** **`VERIFIED_LOCAL_FAKE`** (Track 1C + Track 1E from-zero ×2 + post-zero regression) — **not** `product_verified`

Phase I (local Fake pilot readiness) is complete. Tracks 1A–1E closed. **No LOCAL_IMPLEMENTATION or LOCAL_VALIDATION blockers remain.**

## Hard blockers summary (recalculated Track 2B OD-009 Accept)

| # | Blocker | Taxonomy | Independently counted? |
| --- | --- | --- | --- |
| 1 | [OD-023](../decisions/open/OD-023-identity-provider.md) production identity provider | **EXTERNAL_VENDOR_DECISION** | **Yes** |
| 2 | [OD-025](../decisions/open/OD-025-secrets-kms.md) managed secrets / KMS | **EXTERNAL_VENDOR_DECISION** | **Yes** |

**Independent EXTERNAL_VENDOR_DECISION count:** **2** (was 3; OD-009 closed by ADR-039).

### Documented money-path follow-ups (not independent vendor decisions)

| Item | Taxonomy | Notes |
| --- | --- | --- |
| Stripe Connect PaymentProvider adapter | **EXTERNAL_IMPLEMENTATION** | ADR-038 |
| Stripe Connect SettlementProvider adapter | **EXTERNAL_IMPLEMENTATION** | ADR-039 |
| Live Stripe sandbox E2E (pay + settle) | **LIVE_EVIDENCE** | After adapters + OD-025 (+ IdP as needed) |
| [OD-010](../decisions/open/OD-010-provider-capability-matrix.md) | **resolved** | ADR-038 + ADR-039 |
| [OD-024](../decisions/open/OD-024-mfa-passkey.md) | EXTERNAL_IMPLEMENTATION | Downstream of OD-023 |
| [OD-035](../decisions/open/OD-035-email-provider.md) | LIVE_EVIDENCE / pilot | Local Fake satisfies G2 |

### Closed (removed from blocker list)

| Item | Status |
| --- | --- |
| FUN-MER-005 merchant `GET /payments/{id}` | Track 1A — **CLOSED** |
| FIN-INV-08 / 09 / 10 | Track 1A — **VERIFIED_LOCAL_FAKE** |
| FIN-INV-07 architecture policy | Track 1B — ADR-036 **Accepted** |
| FIN-INV-07 product workflow | Track 1C — **CLOSED** |
| FIN-INV-07 from-zero + regression | Track 1E — **CLOSED** → **`VERIFIED_LOCAL_FAKE`** |
| Evidence/status alignment | Track 1D / **1F** |
| OD-036 funds-flow / MoR | Track 2A — **CLOSED** (ADR-037) |
| OD-008 PSP vendor selection | Track 2 — **CLOSED** (ADR-038) |
| OD-009 settlement partner | Track 2B — **CLOSED** (ADR-039) |
| OD-010 capability matrix | Track 2B — **CLOSED** (ADR-038+039) |

## Execution tracks

### Track 1A — **CLOSED**

FUN-MER-005 + FIN-INV-08/09/10 local Fake evidence.

### Track 1B — **CLOSED**

ADR-036 compensating correction policy.

### Track 1C — **CLOSED**

ADR-036 workflow + FIN-INV-07 executable suite implemented.

### Track 1D — **CLOSED**

Evidence alignment; withheld FIN-INV-07 promotion pending from-zero.

### Track 1E — **CLOSED**

From-zero ×2 + focused suite (18 scenarios) + post-zero Track 1C / Phase I / Phase H / integration + full regression.

### Track 1F — **CLOSED**

Promote FIN-INV-07 → `VERIFIED_LOCAL_FAKE`; rebase MVP to **EXTERNAL BLOCKERS**; **4** independent blockers.

### Track 2 — OD-008 PSP DECISION GATE — **STOP (OD remains open)**

Gate date: 2026-08-25. Evidence: [phase-od-008-psp-decision-gate](./phase-od-008-psp-decision-gate.md).

- Capability profile + `PaymentProvider` conformance **documented**
- **No vendor selected** — marketplace / MoR / funds-flow model unresolved at that gate
- Prerequisite opened: [OD-036](../decisions/open/OD-036-collection-funds-flow-operating-model.md)
- Independent MVP blocker count **unchanged at 4** (OD-036 is prerequisite nested under OD-008, not a fifth counted vendor blocker)

### Track 2A — OD-036 funds-flow / MoR — **PASS**

Gate date: 2026-08-25. Binding: [ADR-037](../decisions/ADR-037-collection-funds-flow-merchant-of-record.md).

- **Accepted:** Option C — connected/sub-merchant marketplace; **merchant MoR**; Sparelane **`NO_CUSTODY`**
- Phase F: **`REINTERPRETATION_ONLY`** (journals unchanged)
- OD-036 **resolved**; OD-008 **still open** (no vendor)
- OD-009 **`NARROWED`** (prefer same-PSP connected payout) — **still independently blocking**
- Independent MVP blocker count **unchanged at 4** (OD-008, OD-009, OD-023, OD-025)
- Production legal review of AU payments perimeter: **NON_BLOCKING_RISK** (required before live production; not a fifth counted blocker)

### Track 2 (resume) — OD-008 PSP DECISION GATE — **PASS**

Gate date: 2026-08-25. Binding: [ADR-038](../decisions/ADR-038-mvp-payment-service-provider-selection.md).

- **Selected:** Stripe Connect **direct charges**; `providerAccountRef = acct_…`; platform `pm_…` + clone
- OD-008 **resolved**; adapter **not** implemented; LIVE_EVIDENCE **pending**
- OD-009 **further narrowed** (prefer Stripe Connect payouts) — **still independently blocking**
- Independent EXTERNAL_VENDOR_DECISION count → **3** (OD-009, OD-023, OD-025)
- Money path still requires EXTERNAL_IMPLEMENTATION (Stripe adapter) + LIVE_EVIDENCE

### Track 2B — OD-009 SETTLEMENT PARTNER — **PASS**

Gate date: 2026-08-25. Binding: [ADR-039](../decisions/ADR-039-mvp-settlement-provider-selection.md).

- **Selected:** Stripe Connect **manual payouts**; `po_…`; destination `ba_…`; SETTLED on **`paid`**
- Gross Settlement preserved via **`fees_collector=application`** (platform pays Stripe processing fees)
- Automatic payout schedule **disabled** for Sparelane-settled connected accounts
- OD-009 **resolved**; OD-010 **resolved**; settlement adapter **not** implemented
- Independent EXTERNAL_VENDOR_DECISION count → **2** (OD-023, OD-025)

### Track 2C — **NEXT: OD-025 MANAGED SECRETS / KMS DECISION GATE**

Required before live/sandbox Stripe credential wiring for PSP + settlement adapters. Parallel Track 3: OD-023 IdP.

### Track 3 — SECURITY / IDP

1. Resolve OD-023 (architecture-first decision gate).
2. Complete OD-024 MFA provider integration against ADR-033/036 (downstream of OD-023).
3. Production auth/MFA evidence.

### Track 4 — OPS / COMPLIANCE (mostly non-blocking for MVP local gate)

OD-021 SIEM, external pen-test, PCI/SOC certification — production-oriented; keep as **NON_BLOCKING_RISK** / **COMPLIANCE_EXTERNAL** unless criteria explicitly require them for MVP acceptance.

## Dependency graph

```text
~~OD-036~~ ADR-037 → ~~OD-008~~ ADR-038 → Stripe PaymentProvider adapter ─┐
~~OD-009~~ ADR-039 → Stripe SettlementProvider adapter ────────────────────┼→ LIVE_EVIDENCE
OD-025 managed secrets ────────────────────────────────────────────────────┘
OD-023 IdP → OD-024 MFA → production auth
```

## Why next is OD-025

| Question | Answer |
| --- | --- |
| Are money vendors selected? | **Yes** — Stripe PSP + settlement (ADR-038/039) |
| Can live adapters ship secrets without OD-025? | **No** for production/sandbox fail-closed design |
| Exact next activity | **OD-025 MANAGED SECRETS / KMS DECISION GATE** |

## MVP requirement matrix (Track 2B PASS)

| Criterion area | Classification |
| --- | --- |
| Local Fake collection / ledger / settlement | **LOCAL_PASS** |
| FIN-INV-01…10 | **LOCAL_PASS** (`VERIFIED_LOCAL_FAKE`) |
| PSP vendor decision | **CLOSED** (ADR-038) |
| Settlement vendor decision | **CLOSED** (ADR-039) |
| Provider capability matrix | **CLOSED** (OD-010) |
| Stripe PaymentProvider adapter | **EXTERNAL_IMPLEMENTATION** |
| Stripe SettlementProvider adapter | **EXTERNAL_IMPLEMENTATION** |
| Live money E2E | **LIVE_EVIDENCE_PENDING** |
| Production IdP / MFA | **EXTERNAL_BLOCKED** (OD-023; OD-024 downstream) |
| Managed secrets | **EXTERNAL_BLOCKED** (OD-025) |
| AU legal perimeter confirmation | **NON_BLOCKING_RISK** |

## Non-blocking risks (not blockers)

- Prisma → deepmerge-ts high advisories (known; no `--force` fix)
- Bounded load drills ≠ capacity certification
- External pen-test / PCI / SOC / hosted SIEM thresholds TBD
- Real email (OD-035) for pilot/production only
- Operating model + Stripe vendors selected; AU licensing/perimeter counsel before live production
- Stripe idempotency key retention (~24h) — reconcile before late re-POST
- Platform bears Stripe processing fees under `fees_collector=application` (commercial COGS)