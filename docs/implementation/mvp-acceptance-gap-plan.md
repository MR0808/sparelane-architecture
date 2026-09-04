# MVP acceptance gap plan

**Gate result:** **MVP ACCEPTANCE: NOT ACCEPTED — EXTERNAL_IMPLEMENTATION + LIVE_EVIDENCE** (independent EXTERNAL_VENDOR_DECISION count: **0**)  
**Date:** 2026-09-03 (ADR-043 Better Auth-all greenfield; prior ADR-042 Hybrid superseded)  
**Evidence:** `sparelane-platform` Track 1A–1E docs; architecture Phase A–I local Fake complete; [ADR-043](../decisions/ADR-043-unified-better-auth-human-authentication.md)  
**FIN-INV-07 decision:** [phase-fin-inv-07-decision-gate](./phase-fin-inv-07-decision-gate.md) — **PASS** ([ADR-036](../decisions/ADR-036-financial-compensating-correction-policy.md))  
**FIN-INV-07 verification:** **`VERIFIED_LOCAL_FAKE`** (Track 1C + Track 1E from-zero ×2 + post-zero regression) — **not** `product_verified`

Phase I (local Fake pilot readiness) is complete. Tracks 1A–1E closed. Human-auth target is **Better Auth-all** (ADR-043). Auth0 LIVE browser/MFA evidence is **not** an MVP mandatory track.

## Hard blockers summary (recalculated ADR-043 Accept)

| # | Blocker | Taxonomy | Independently counted? |
| --- | --- | --- | --- |
| — | *(none)* | — | **Independent EXTERNAL_VENDOR_DECISION count: 0** |

**Independent EXTERNAL_VENDOR_DECISION count:** **0**.

**MVP acceptance remains NOT ACCEPTED** — EXTERNAL_IMPLEMENTATION + evidence remain.

### Documented follow-ups (not independent vendor decisions)

| Item | Taxonomy | Notes |
| --- | --- | --- |
| Managed secret backends (Secrets Manager + KMS envelope) | **EXTERNAL_IMPLEMENTATION** | ADR-040 |
| Stripe Connect Payment/Settlement adapters + LIVE_EVIDENCE | **EXTERNAL_IMPLEMENTATION** / **LIVE_EVIDENCE** | ADR-038/039 — do not re-run unnecessarily if already evidenced |
| Better Auth foundation + all-human auth (AUTH-B0…) | **EXTERNAL_IMPLEMENTATION** | ADR-043; [unified checklist](./better-auth-unified-platform-checklist.md) |
| BETTER_AUTH_SECURITY_EVIDENCE | **LIVE_EVIDENCE** / LOCAL | AUTH-B2/B7 |
| BETTER_AUTH_PRIVILEGED_MFA_EVIDENCE | **LIVE_EVIDENCE** / LOCAL | BETTER-AUTH-PRIV-001; OD-024 |
| Auth0 LIVE browser/MFA evidence | **NOT_REQUIRED** | Removed from MVP track (ADR-043) |
| [OD-024](../decisions/open/OD-024-mfa-passkey.md) | EXTERNAL_IMPLEMENTATION | Narrowed; not production-verified |
| [OD-035](../decisions/open/OD-035-email-provider.md) | LIVE_EVIDENCE / pilot | Verification/reset mail |

### Closed (removed from blocker list)

| Item | Status |
| --- | --- |
| OD-023 production IdP | **CLOSED** — ADR-043 Better Auth-all |
| Auth0 as MVP IdP dependency | **REMOVED** from target (AUTH-B6 cleanup later) |
| Hybrid Auth0 privileged path (ADR-042) | **SUPERSEDED** |

### Track 5 — ADR-043 GREENFIELD BETTER AUTH-ALL — **PASS (architecture)**

Gate: [greenfield-better-auth-all-gate.md](../decisions/greenfield-better-auth-all-gate.md).

- **Selected:** Better Auth for consumer + merchant + admin
- MFA: Sparelane AuthenticationAssurance + TOTP; ≤15m ADR-033 unchanged
- Next platform activity: **AUTH-B0 Better Auth foundation**

### Track 6 — **NEXT: AUTH-B0_BETTER_AUTH_FOUNDATION**

1. AUTH-B0…AUTH-B-EXIT per unified checklist
2. Stripe evidence: retain; do not repeat unnecessarily
3. Do not finish Auth0 LIVE evidence as MVP mandatory
4. AUTH-B6 Auth0 removal after Better Auth evidence

---

## Historical notes (Track 3 era — superseded)

| # | Blocker | Taxonomy | Independently counted? |
| --- | --- | --- | --- |
| — | *(none)* | — | **Independent EXTERNAL_VENDOR_DECISION count: 0** |

**Independent EXTERNAL_VENDOR_DECISION count:** **0** (was 1; OD-023 closed by ADR-041).

**MVP acceptance remains NOT ACCEPTED** — EXTERNAL_IMPLEMENTATION + LIVE_EVIDENCE remain.

### Documented follow-ups (Track 3 era — historical)

| Item | Taxonomy | Notes |
| --- | --- | --- |
| Managed secret backends (Secrets Manager + KMS envelope) | **EXTERNAL_IMPLEMENTATION** | ADR-040 — **next recommended** |
| Stripe Connect PaymentProvider adapter | **EXTERNAL_IMPLEMENTATION** | ADR-038 |
| Stripe Connect SettlementProvider adapter | **EXTERNAL_IMPLEMENTATION** | ADR-039 |
| Auth0 AuthenticationProvider + admin MFA step-up | **EXTERNAL_IMPLEMENTATION** | ADR-041; OD-024 narrowed |
| Live Stripe sandbox E2E (pay + settle) | **LIVE_EVIDENCE** | After secrets + Stripe adapters |
| Live Auth0 sandbox auth/MFA evidence | **LIVE_EVIDENCE** | After Auth0 adapter |
| [OD-024](../decisions/open/OD-024-mfa-passkey.md) | EXTERNAL_IMPLEMENTATION | Narrowed; not a vendor blocker |
| [OD-035](../decisions/open/OD-035-email-provider.md) | LIVE_EVIDENCE / pilot | Local Fake satisfies G2 |

### Closed (removed from blocker list) — Track 3 era

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
| OD-025 managed secrets / KMS | Track 2C — **CLOSED** (ADR-040) |
| OD-023 production IdP | Track 3 — **CLOSED** (ADR-041) |

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

### Track 2C — OD-025 MANAGED SECRETS / KMS — **PASS**

Gate date: 2026-08-25. Binding: [ADR-040](../decisions/ADR-040-mvp-managed-secrets-and-key-management-policy.md).

- **Selected:** Split — AWS Secrets Manager (low-cardinality) + KMS-envelope Postgres (high-cardinality webhooks)
- Sandbox uses **real** managed architecture (Stripe test keys); fail closed preserved
- OD-025 **resolved**; backends **not** implemented
- Independent EXTERNAL_VENDOR_DECISION count → **1** (OD-023)
- Money path: managed-secrets EXTERNAL_IMPLEMENTATION → Stripe adapters → LIVE_EVIDENCE

### Track 3 — OD-023 PRODUCTION IdP — **PASS**

Gate date: 2026-08-25. Binding: [ADR-041](../decisions/ADR-041-mvp-production-identity-provider-selection.md) (later **Superseded** by ADR-042).

- **Selected (then):** Auth0 human IdP for all humans; Sparelane remains authorisation SoT
- ADR-033 MFA: Auth0 step-up + `amr` contains `mfa` → `mfaSatisfiedAt` (≤15 min); fail closed
- OD-023 **resolved**; OD-024 **narrowed**; Auth0 adapter **not** implemented at that gate
- Independent EXTERNAL_VENDOR_DECISION count → **0**
- **MVP acceptance still NOT ACCEPTED**

### Track 4 — ADR-041 RECONSIDERATION / ADR-042 HYBRID — **PASS (architecture; later superseded)**

Gate date: 2026-09-03. Binding: [ADR-042](../decisions/ADR-042-human-authentication-population-split.md) — later **Superseded** by ADR-043.

- **Selected (then):** Auth0 for merchant/admin; Better Auth for consumers
- Platform code **not** changed in that gate

### Track 5 — ADR-043 GREENFIELD BETTER AUTH-ALL — **PASS (architecture)**

See top of this document. Binding: [ADR-043](../decisions/ADR-043-unified-better-auth-human-authentication.md).

### Track 6 — **NEXT: AUTH-B0_BETTER_AUTH_FOUNDATION**

1. AUTH-B0…AUTH-B-EXIT ([unified checklist](./better-auth-unified-platform-checklist.md))
2. Retain Stripe LIVE evidence; do not repeat unnecessarily
3. Auth0 LIVE MFA evidence **NOT_REQUIRED** for MVP
4. AUTH-B6 remove Auth0 after Better Auth evidence

### Track notes — OPS / COMPLIANCE (mostly non-blocking for MVP local gate)

OD-021 SIEM, external pen-test, PCI/SOC certification — production-oriented; keep as **NON_BLOCKING_RISK** / **COMPLIANCE_EXTERNAL** unless criteria explicitly require them for MVP acceptance.

## Dependency graph

```text
~~OD-036~~ ADR-037 → ~~OD-008~~ ADR-038 → Stripe PaymentProvider ─┐
~~OD-009~~ ADR-039 → Stripe SettlementProvider ───────────────────┼→ LIVE_EVIDENCE (retain)
~~OD-025~~ ADR-040 → managed-secret backends ─────────────────────┤
~~OD-023~~ ADR-043 → Better Auth AUTH-B* + AuthenticationAssurance ┘
```

## Why next is AUTH-B0

| Question | Answer |
| --- | --- |
| Remaining EXTERNAL_VENDOR_DECISION? | **None** |
| Does MVP acceptance pass? | **No** — AUTH-B* + BETTER_AUTH_* evidence remain |
| Exact next activity | **AUTH-B0 Better Auth foundation** |

## MVP requirement matrix (ADR-043)

| Criterion area | Classification |
| --- | --- |
| Local Fake collection / ledger / settlement / auth | **LOCAL_PASS** |
| FIN-INV-01…10 | **LOCAL_PASS** (`VERIFIED_LOCAL_FAKE`) |
| IdP architecture | **CLOSED** (ADR-043 Better Auth-all) |
| AUTH-B* Better Auth implementation | **EXTERNAL_IMPLEMENTATION** |
| BETTER_AUTH_SECURITY / PRIVILEGED_MFA evidence | **EVIDENCE_PENDING** |
| Auth0 LIVE evidence | **NOT_REQUIRED** |
| Stripe LIVE evidence | **RETAIN** (do not re-run unnecessarily) |
| MVP acceptance | **NOT ACCEPTED** |

## Non-blocking risks (not blockers)

- Prisma → deepmerge-ts high advisories (known; no `--force` fix)
- Bounded load drills ≠ capacity certification
- External pen-test / PCI / SOC / hosted SIEM thresholds TBD
- Real email (OD-035) for pilot/production only
- Operating model + Stripe vendors selected; AU licensing/perimeter counsel before live production
- Stripe idempotency key retention (~24h) — reconcile before late re-POST
- Platform bears Stripe processing fees under `fees_collector=application` (commercial COGS)
- OD-016 cloud provider still open; ADR-040 requires AWS for MVP money-path secrets