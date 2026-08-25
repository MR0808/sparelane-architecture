# MVP acceptance — Track 2 OD-008 PSP decision gate

**Date:** 2026-08-25  
**Track 2 initial:** **STOP** (OD-036 prerequisite)  
**Track 2A:** **PASS** (ADR-037)  
**Track 2 resume:** **PASS — OD-008 resolved by [ADR-038](../decisions/ADR-038-mvp-payment-service-provider-selection.md)**  
**Selected:** **Stripe Connect — direct charges**  
**Exit:** **MVP TRACK 2 OD-008: PASS**

## Verdict

Accept **Stripe Connect** with **direct charges** as the MVP PSP under ADR-037.

- Merchant MoR; funds land in connected-account balance; Sparelane `NO_CUSTODY`
- Cross-merchant token reuse via official PaymentMethod **clone** pattern (`SUPPORTED_VIA_PROVIDER_PATTERN`)
- Idempotency + PaymentIntent retrieve satisfy UNKNOWN recovery
- **No adapter implemented** in this gate; LIVE_EVIDENCE still pending

## Research access date

**2026-08-25** — official Stripe, Adyen, Airwallex, and Pin Payments documentation.

## Hard eliminations

| Candidate | Reason |
| --- | --- |
| Destination / separate charges+transfers (Stripe) | Platform balance custody — conflicts ADR-037 |
| Pin Payments marketplace Transfers guide | Platform balance then payout — PLATFORM_CUSTODY |
| Pin Merchants API alone | Separate merchant vaults; token reuse unproven |

## Soft non-selection

| Candidate | Reason |
| --- | --- |
| Adyen for Platforms | AU capable; liable-balance defaults + onboarding/token-share complexity — weaker pilot fit |
| Airwallex connected accounts | Credible; weaker proven public parity for Sparelane PaymentProvider + clone/reuse in this gate |

## Binding summary (see ADR-038)

| Topic | Binding |
| --- | --- |
| `providerAccountRef` | `acct_…` |
| Token | Platform `pm_…` + clone |
| Success | PaymentIntent `succeeded` (auto-capture) |
| Idempotency | `attempt.publicId`; ~24h retention |
| Lookup | Retrieve `pi_…` + Stripe-Account; safe identical re-POST |
| ACTION_REQUIRED | `requires_action` → existing Sparelane state |
| OD-009 | Prefer Stripe Connect payouts |

## Capability profile (unchanged requirements)

Prior Track 2 capability profile remains binding; ADR-038 proves Stripe satisfies it under Connect direct charges.

## Fake / real conformance suite

Unchanged list in historical section below — future Stripe adapter must pass Fake suite + Stripe test-mode scenarios.

## Platform checklist

See [stripe-connect-adapter-checklist.md](./stripe-connect-adapter-checklist.md).

## Exact next activity

**OD-009 SETTLEMENT PARTNER DECISION GATE** (prefer Stripe Connect payouts).

---

## Historical: Track 2 STOP / Track 2A

Prerequisite OD-036 was unbound → STOP. Track 2A Accepted ADR-037 Option C. See ADR-037 and earlier sections of conversation history / gap plan.
