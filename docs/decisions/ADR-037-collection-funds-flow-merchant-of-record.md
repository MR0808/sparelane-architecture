---
id: ADR-037
title: Collection Funds-Flow and Merchant-of-Record Operating Model
status: Accepted
date: 2026-08-25
deciders: Architecture
consulted: Product (commercial-model evidence) / Money / Settlement / Integrations
informed: Platform engineering / Legal (production gate)
supersedes: []
related:
  - ADR-001
  - ADR-002
  - ADR-005
  - ADR-006
  - ADR-007
  - ADR-010
  - ADR-014
  - ADR-026
  - ADR-027
  - ADR-028
  - ADR-029
  - OD-008
  - OD-009
  - OD-010
  - OD-012
  - OD-036
---

# ADR-037 — Collection Funds-Flow and Merchant-of-Record Operating Model

## Status

**Accepted**

Resolves [OD-036](./open/OD-036-collection-funds-flow-operating-model.md). Unblocks resumption of [OD-008](./open/OD-008-psp-selection.md) under explicit provider-family constraints. Does **not** select a PSP vendor, does **not** select a settlement partner, and does **not** close OD-008 or OD-009.

## Context

Track 2 OD-008 STOPPED because architecture could not bind:

1. Who is merchant of record (MoR) for consumer card collection
2. Where captured funds land economically
3. Whether Sparelane takes custody/control of pooled merchant funds before merchant payout
4. How Phase F Settlement (ADR-027/028/029) relates to real cash movement
5. How consumer-owned payment-method tokens interact with merchant PSP accounts

ADR-026 deliberately left **regulatory/custody characterisation TBD**. Commercial and product materials describe Sparelane as a **payment reliability / SaaS orchestration layer** (platform + transaction fees), not as a classic marketplace MoR or lender ([ADR-005](./ADR-005-collection-before-settlement.md), [ADR-007](./ADR-007-merchant-billing-system-of-record.md), START-HERE, commercial-model pricing).

Phase F Fake settlement models Sparelane submitting a payout instruction and posting Dr merchant payable / Cr settlement clearing — which can be misread as Sparelane-custodied PayFac. That ambiguity blocked OD-008.

## Decision question (binding answer)

For MVP card collection:

| Question | Binding answer |
| --- | --- |
| Who is the acquiring / merchant party with the PSP for the consumer charge? | The **merchant** via a **connected / sub-merchant** account under Sparelane’s **platform PSP relationship** |
| Where do captured funds land first economically? | The **merchant’s connected/sub-merchant PSP balance** (provider-controlled) — **not** a Sparelane bank/trust/FBO account |
| Does Sparelane take custody/control of pooled merchant funds before merchant payout? | **No** — custody classification **`NO_CUSTODY`** for Sparelane; funds between capture and merchant bank are **`PROVIDER_CONTROLLED_MARKETPLACE`** |

## Selected operating model

### Option C — Marketplace / Connected Sub-Merchant (platform-orchestrated)

**Canonical name:** `CONNECTED_SUB_MERCHANT_ORCHESTRATOR`

| Dimension | Binding |
| --- | --- |
| Technical role | Sparelane **orchestrates** payment attempts, retries, ledger, settlement eligibility/instruction lifecycle |
| Commercial role | SaaS / reliability platform charging **separately invoiced** platform + transaction fees (gross collection accounting; fee netting deferred) |
| MoR | **Merchant is MoR** for the underlying goods/services and the consumer payment |
| PayFac / classic MoR | Sparelane is **not** merchant of record and **does not** adopt Option B platform aggregation / Sparelane-controlled pooled balances for MVP |
| Custody | Sparelane **`NO_CUSTODY`** |
| Funds path | Consumer → PSP → **merchant connected/sub-merchant balance** → merchant bank (provider-mediated; Sparelane may instruct/confirm via Settlement domain) |

### Explicit distinctions (do not blur)

| Concept | Sparelane MVP stance |
| --- | --- |
| Technical orchestration | **Yes** — Payment Orchestrator / Reliability Engine |
| Merchant of record | **Merchant** — Sparelane is never MoR for MVP card collection |
| Payment facilitator / marketplace role | **Platform + connected/sub-merchant** relationship with the PSP; Sparelane does **not** hold merchant money |
| Custody/control of funds | **No Sparelane custody**; provider controls connected balances |
| Settlement/payout responsibility | Sparelane **tracks** obligations and may **submit/confirm** provider payout instructions; cash movement is provider/bank-mediated |
| Accounting evidence | Double-entry journals remain Sparelane’s operational financial SoT for collection/settlement **eligibility and discharge** — not proof of Sparelane legal title to funds |

## MoR bindings

| Question | Answer |
| --- | --- |
| Who sells the underlying merchant goods/services? | **Merchant** |
| Who appears as merchant for the consumer payment? | **Merchant** (merchant / connected-account descriptor preferred) |
| Who handles refunds/disputes from the consumer’s perspective (eventual)? | **Merchant** as MoR; PSP processes through connected account; Sparelane may orchestrate later (out of MVP) |
| Whose descriptor should appear? | **Merchant** (or provider-required connected-account form) — not “Sparelane” as seller |
| Whose PSP merchant account receives the payment? | Merchant **connected/sub-merchant** account identified by `providerAccountRef` |
| Is Sparelane ever MoR? | **No** for MVP card collection |

## Collection funds destination

Successful PSP capture lands economically in:

**B — Connected sub-merchant balance controlled by the PSP**

Not:

- Sparelane platform master balance as pooled merchant custody (Option B)
- Sparelane bank / trust / FBO account
- “Processor clearing” as a legal custody claim owned by Sparelane

Ledger account `sys:processor-clearing:…` remains an **operational clearing control account** representing Sparelane’s recognised claim/evidence of verified collection for accounting integrity — **not** assertion that Sparelane holds client money.

## Custody classification

| Classification | Selected |
| --- | --- |
| `NO_CUSTODY` | **Selected for Sparelane** |
| `PROVIDER_CONTROLLED_MARKETPLACE` | Describes PSP-held connected balances between capture and merchant bank |
| `PLATFORM_CUSTODY` | **Rejected** for MVP |
| `TBD` | **Not permitted** after this ADR |

Sparelane must **not**:

- receive merchant collection proceeds into a Sparelane-controlled bank/trust/FBO
- hold pooled merchant money between collection and payout
- own a stored-value balance representing customer/merchant money for collection (wallet remains separate — [OD-012](./open/OD-012-wallet-custody-licensing.md))
- sweep funds through Sparelane-owned accounts as part of MVP collection

Sparelane **may**:

- instruct or confirm **provider** payout from connected balance to merchant payout destination
- gate settlement eligibility on ledger confirmation, merchant status, and `APPROVED_FOR_SETTLEMENT` ([ADR-027](./ADR-027-settlement-obligation-eligibility-cardinality.md))

## providerAccountRef

| Rule | Binding |
| --- | --- |
| Meaning | Opaque reference to the merchant’s **connected / sub-merchant** acquiring account at the selected PSP |
| Mandatory (production / live sandbox money) | **Yes** for collection execution |
| Local Fake | May continue optional/absent for Fake-only integrity evidence |
| Ownership | Merchant configuration in Sparelane SoT (merchant/provider config) |
| Provisioning | Platform-triggered PSP connected-account onboarding (exact UX vendor-specific; OD-008) |
| Multiplicity | One primary `providerAccountRef` per merchant per provider/environment for MVP; additional accounts are out of MVP unless a later ADR |
| Environment scope | Distinct refs for sandbox vs live; never cross-wire |
| Charge context | Every live `executePayment` **must** use merchant-resolved provider account context |
| Trust | **Never** from request headers, bill payload, or consumer input ([ADR-014](./ADR-014-merchant-tenant-isolation.md)) |

## Consumer payment-method tokens

| Rule | Binding |
| --- | --- |
| Vault scope | **Platform / connected-marketplace scoped** under the platform PSP relationship (or network tokens usable for connected charges) |
| Cross-merchant reuse | **Allowed** only because tokens are platform-scoped and charges are executed **on behalf of** the target merchant’s connected account |
| Forbidden assumption | Do **not** assume a token stored against Merchant A’s **wholly separate direct** PSP vault can charge Merchant B’s unrelated direct vault |
| Portability | Non-portable to a future pure Option A (isolated merchant vaults) without re-tokenisation or network-token redesign |

This preserves existing consumer-owned `payment_methods` uniqueness `(provider, provider_token_ref)` and multi-connection reuse without inventing per-merchant token copies for MVP.

## Merchant onboarding / KYB

| Concern | Binding |
| --- | --- |
| Sparelane merchant status / `APPROVED_FOR_SETTLEMENT` | Sparelane obligation (existing settlement gate) |
| PSP connected-account KYB / onboarding | **Provider-mediated**; required before live collection against that merchant |
| Separation | Sparelane merchant row ≠ automatically PSP-ready; both must be satisfied for live money |
| Compliance burden | Sparelane owns platform KYB/approval gates; PSP owns provider KYB for connected accounts; production legal characterisation of Sparelane’s facilitation role requires counsel ([§ Legal](#legal--regulatory-caveat)) |

## Fees

| Rule | Binding |
| --- | --- |
| Sparelane platform / transaction fees | **Invoiced separately** (SaaS economics); **not** deducted from collected bill amount in MVP collection/payout journals |
| Gross settlement model | **Remains valid** ([ADR-026](./ADR-026-collection-ledger-posting-minimal-coa.md), [ADR-029](./ADR-029-settlement-finality-reconciliation-payout-accounting.md)) |
| PSP fees | May be deducted by the PSP from merchant connected-account settlement **outside** Sparelane MVP journals |
| Application-fee / destination-charge fee take | **Not** required for MVP ledger; if a future product chooses in-flow fee take, a new ADR must reopen fee accounting |

## Refunds / chargebacks (ownership only — not MVP implementation)

| Event | Ownership stance |
| --- | --- |
| Consumer refund | Merchant MoR; executed against connected account via PSP (Sparelane orchestration later) |
| Chargeback / dispute | Merchant MoR + PSP connected-account liability rules |
| Negative connected balance | Provider/merchant problem under connected-account terms — Sparelane must not invent Sparelane-funded cover for MVP |

## Collection ledger interpretation (ADR-026)

Journal template **unchanged**:

`Dr processor clearing` / `Cr merchant payable` (gross)

Economic meaning under this ADR:

| Account | Meaning |
| --- | --- |
| Processor clearing | Operational recognition that a **verified provider-backed collection** occurred for this workflow; **not** Sparelane bank cash; **not** Sparelane legal custody of client money |
| Merchant payable | Operational **payable eligibility / obligation tracking** for amounts collected for the merchant that are expected to settle via **provider-mediated** payout — **not** assertion that Sparelane holds those funds as custodian |

## Settlement domain interpretation (ADR-027/028/029)

Phase F compatibility: **`REINTERPRETATION_ONLY`**

| Artefact | Interpretation under Option C |
| --- | --- |
| Settlement obligation | Sparelane’s record that a collected workflow is owed to the merchant **via the provider payout path** |
| Merchant payable | Operational liability tracking (see above) |
| Payout destination | Merchant bank destination token for **provider** payout |
| SettlementInstruction | Instruction to the settlement provider adapter — preferably the **same PSP’s connected-account payout API**, else a distinct OD-009 rail |
| SETTLED | Provider-normalised payout completion + payout journal — **not** proof Sparelane moved money from a Sparelane bank account |

FakeSettlementProvider remains valid **local software integrity** evidence. It must not be read as proving Sparelane legal custody.

## Payout ledger interpretation (ADR-029)

Journal template **unchanged**:

`Dr merchant payable` / `Cr settlement clearing` (gross)

| Account | Meaning |
| --- | --- |
| Merchant payable | Discharged operational payable for that settlement |
| Settlement clearing | Control account for **provider-mediated** payout in flight / completed — **not** Sparelane ADI cash |

Sparelane **initiates/confirms** payout through the SettlementProvider abstraction; the PSP (or approved settlement partner) **executes** the transfer from connected balance to merchant destination. Bank movement occurs **outside** Sparelane-controlled accounts under this model.

## OD-008 provider-family constraints

OD-008 may consider only PSP families that support **platform + connected/sub-merchant (marketplace) charging** with:

1. Merchant-scoped connected account (`providerAccountRef`)
2. Platform-scoped (or network) customer tokens usable for charges on behalf of connected merchants
3. Capture landing in connected/sub-merchant balance (not Sparelane pooled custody)
4. Payout capability from connected balance to merchant bank **or** clear documentation that a separate OD-009 rail is still required

Candidate families remain examples only (Stripe Connect-class, Adyen platform/marketplace-class, Airwallex connected-class, etc.). **No vendor is selected by this ADR.**

**Rejected for MVP OD-008 shortlist unless a later ADR revisits OD-036:**

- Pure Option B PayFac / Sparelane master-balance aggregation with Sparelane custody
- Pure Option A isolated direct merchant vaults that break cross-merchant token reuse without platform/network token support

## OD-009 implications

| Outcome | Binding |
| --- | --- |
| Status | **`NARROWED`** — still **MVP-blocking** until Accept |
| Prefer | Same selected PSP’s connected-account **payout** capability implements SettlementProvider |
| Distinct settlement/banking partner | Required **only if** the selected PSP cannot pay out connected balances to merchant bank destinations meeting ADR-028 |
| Not | Automatically closed or superseded by OD-036 |
| Not | Unchanged “always separate bank partner” assumption from ADR-006 narrative — ADR-006 lifecycle separation remains; **vendor identity** may coincide with PSP |

## Rejected options

### Option A — Software orchestrator / wholly merchant-owned direct PSP accounts only

Rejected as **sole** MVP model because consumer-owned cross-merchant payment methods would require either incompatible separate vaults or silent architecture break. Connected accounts under a **platform** PSP relationship are required for token reuse → classified as Option C.

### Option B — Platform aggregation / Sparelane custody or classic PayFac pooled funds

Rejected for MVP: conflicts with stated orchestrator / SaaS intent, increases AU regulatory perimeter (facilitation / stored-value / client-money risk), and is unnecessary given connected-account patterns.

### Option D — Explicit hybrid multi-path

Rejected for MVP: would re-defer OD-008. One path only.

## Phase F / platform consequence class

| Class | Selected |
| --- | --- |
| `ALIGNED` | — |
| `REINTERPRETATION_ONLY` | **Selected** |
| `ARCHITECTURE_CHANGE_REQUIRED` | No journal template change; docs/ADR interpretation update |
| `PLATFORM_CHANGE_REQUIRED` | **Not required to Accept OD-036**; live money later requires mandatory `providerAccountRef` + connected onboarding (implementation after OD-008) |

## Financial invariants

FIN-INV-01…10 local Fake evidence remains **valid as software correctness**. Economic interpretation of payable/clearing accounts is clarified by this ADR; do **not** invalidate local tests. Real-money verification remains blocked on OD-008/009/025 (+ IdP as needed).

## Legal / regulatory caveat

Australian payments licensing reforms are modernising PSP regulation (Treasury payments licensing reforms; activity-based AFSL perimeter for defined payment functions — see https://treasury.gov.au/policy-topics/banking-and-finance/payments-licensing-reforms). Architecture classification:

| Posture | Value |
| --- | --- |
| Legal posture for selected model | **`LEGAL_REVIEW_REQUIRED`** before live production |
| Architecture Accept | Permitted **subject to** qualified counsel confirming the no-custody / connected-sub-merchant posture before production go-live |
| Claim | Architecture does **not** assert Sparelane is licensed / not licensed |

This legal-review requirement is a **production risk**, not a fifth counted MVP external vendor blocker and not a blocker to OD-008 selection work.

## Consequences

### Positive

- OD-008 can resume with a closed provider-family filter
- MoR / custody / funds landing are explicit
- Token reuse preserved
- Phase F journals retained with corrected economics
- OD-009 scope narrowed without false closure

### Negative / follow-ups

- Merchant live onboarding must include PSP connected-account readiness
- Production legal review mandatory before live money
- Wallet custody still separate (OD-012)
- Platform must eventually enforce mandatory `providerAccountRef` for non-Fake providers

## Alternatives considered

Documented above (A/B/D). STOP was considered if product owner insisted on Sparelane MoR or custody; existing product/commercial evidence supports Option C without inventing that intent.

## Dependencies / open questions

- OD-008 — select PSP within constrained family
- OD-009 — confirm payout rail (prefer same PSP; else partner)
- OD-010 — complete provider matrices after vendors
- OD-012 — wallet custody unchanged
- Production legal confirmation of perimeter

## Related architecture

- Docs: `docs/money/ledger-model.md`, settlement docs, `docs/implementation/mvp-acceptance-gap-plan.md`, `docs/implementation/phase-od-008-psp-decision-gate.md`
- Requirements: FUN-PAY / FUN-SET / INT-PSP notes
- LikeC4: settlement views — provider-mediated payout clarification
- Supersedes: ADR-026 “regulatory/custody characterisation TBD” **for MVP collection operating model** (journal template unchanged)
