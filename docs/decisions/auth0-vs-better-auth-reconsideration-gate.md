---
id: GATE-AUTH-041-RECONSIDER
title: Auth0 vs Better Auth reconsideration gate (ADR-041 reopen)
status: Complete
date: 2026-09-03
outcome: HYBRID_AUTH0_PRIVILEGED_BETTER_AUTH_CONSUMER
binding: ADR-042
---

# Auth0 vs Better Auth — ADR-041 reconsideration gate

**Date:** 2026-09-03  
**Outcome:** **HYBRID** — Auth0 for merchant users + platform admins; Better Auth for consumers.  
**Binding ADR:** [ADR-042](./ADR-042-human-authentication-population-split.md) (Accepted).  
**ADR-041:** [Superseded](./ADR-041-mvp-production-identity-provider-selection.md).  
**Platform:** READ-ONLY evidence only; no Auth0 rip-out; no Better Auth implementation in this gate.

Sources (pricing retrieved 2026-09-03):

- Auth0: https://auth0.com/pricing.md
- Better Auth pricing: https://better-auth.com/pricing
- Better Auth 2FA plugin docs: https://www.better-auth.com/docs/plugins/two-factor

## 1. ADR-041 summary (pre-gate)

Accepted 2026-08-25. Selected **Auth0 for all human authentication**. Sparelane remains authZ SoT. MFA for ADR-033 via Auth0 step-up + `amr` containing MFA + `auth_time` → `mfaSatisfiedAt` ≤15m. Resolved OD-023; narrowed OD-024. Rejected Cognito/Clerk/Better Auth as sole MVP IdP (Better Auth rejected for expanding owned auth surface).

## 2. Platform abstraction (provider-neutral today)

Observed in `sparelane-platform` (read-only):

| Concept | Provider-neutral? |
| --- | --- |
| `AuthenticationProvider` | Yes |
| `AuthenticatedSubject` | Yes |
| `ExternalIdentity(issuer, subject)` → `User` | Yes |
| `MerchantMembership` / consumer authority / `PlatformAdminGrant` | Sparelane-owned (yes) |
| `PrivilegedAuthenticationContext` + ≤15m MFA | Policy Sparelane; evidence adapter-derived |
| Auth0AuthenticationProvider + JOSE/JWKS | Auth0-specific adapter |
| Fake/Dev / LocalExternal providers | Test/local adapters |
| BFF `/auth/login|callback|logout` + HTTP-only session | Auth0-oriented today; boundary is still “verified subject → session” |

## 3–5. Population models

### Consumer

| Dimension | Assessment |
| --- | --- |
| Scale | Potentially very large MAU |
| Auth frequency | Episodic (pay, manage methods, view bills) |
| MFA | Not ADR-033; optional product step-up later |
| Needs | Email identity, recovery, session, ATO protections |
| SSO / enterprise | Unlikely |
| Lifecycle | Sparelane consumer profile + connection |
| Support | Password reset / lockout volume scales with MAU |
| Sensitivity | Payment methods / PII — high privacy, not admin privilege |

### Merchant user

| Dimension | Assessment |
| --- | --- |
| Scale | Small–moderate (staff per merchant) |
| Auth frequency | Daily ops |
| MFA | Recommended; required when privileged merchant ops demand |
| Needs | Portal login; future Google/Microsoft; eventual SSO/SAML for large merchants |
| Enterprise | Possible later — Auth0 B2B/orgs fit |
| Sensitivity | Billing config / API credentials UI — elevated |

### Platform administrator

| Dimension | Assessment |
| --- | --- |
| Scale | Very small |
| MFA / step-up | **Mandatory** ADR-033 ≤15m |
| Needs | Phishing-resistant trajectory, revocation, audit |
| Cost | Security >> MAU cost |
| Sensitivity | Highest |

## 6. Scale scenarios (sensitivity, not forecasts)

| Scenario | Consumer MAU | Merchant/admin MAU |
| --- | --- | --- |
| S1 Early MVP | 1,000 | ~100 merchants + small admin |
| S2 Early scale | 10,000 | 1,000 |
| S3 Growth | 100,000 | 5,000 |
| S4 Large | 1,000,000 | 20,000 |

## 7. Auth0 pricing research (authoritative)

From https://auth0.com/pricing.md (2026-09-03):

| Item | Published |
| --- | --- |
| Free | **25,000 MAU**, $0; MFA on Free is limited vs paid |
| B2C Essentials | $35/mo @ 500 MAU; **$70 @ 1k**; **$700 @ 10k**; **$3,500 @ 50k** (monthly table) |
| B2C Professional | Contact us ~30k+ |
| B2C 100k / 1M | **CUSTOM_QUOTE** (not in published Essentials table) |
| B2B Essentials | $150 @ 500; **$300 @ 1k**; **$2,100 @ 10k**; **$3,800 @ 20k**; 30k+ Contact us |
| B2B Professional | Higher base; 20k+ often Contact us |
| Enterprise MFA add-on (B2B Essentials) | $100/mo listed |
| Enterprise SSO connections | Included counts + $100/mo per extra (caps apply) |
| M2M token add-ons | Published token packs (secondary for Sparelane human auth) |
| Yearly | Typically 11× monthly on listed plans |

Do not invent enterprise quotes beyond CUSTOM_QUOTE.

## 8. Better Auth cost model

| Layer | Model |
| --- | --- |
| SOFTWARE_LICENSE_COST | **$0** (open-source framework) |
| OPERATING_COST | App + Postgres for users/sessions + email (OD-035) + eng ownership of patches/abuse |
| OPTIONAL_MANAGED_SERVICE_COST | Starter $0; **Pro $20/mo**; Enterprise custom; SSO connections +$50/mo each on managed (per better-auth.com/pricing) |
| MAU pricing | **None** for self-hosted |
| Capabilities | Email/password, sessions, 2FA plugin (TOTP/backup), passkey plugin, organization plugin, social OAuth, managed SSO/SCIM on paid infra |

## 9–12. Indicative subscription / fee comparison (monthly USD)

Assumptions:

- Auth0-all: treat total human MAU ≈ consumer + merchant/admin; use **B2C Essentials** where published; else CUSTOM_QUOTE.
- Hybrid Auth0 leg: merchant/admin MAU only on **B2B Essentials** (closest published B2B table); consumers = Better Auth self-host.
- Better Auth self-host fee = **$0 license**; infrastructure = magnitude class only.

| Population model | Auth0 (all humans) | Better Auth self-hosted (license) | Hybrid (Auth0 privileged + BA consumer) |
| --- | ---: | ---: | ---: |
| ~1k total / S1 | **$0 Free** (≤25k) or ~$70 Essentials if paid MFA needed | $0 + INFRA_SMALL | Auth0 Free/Essentials on ~100 MAU + BA $0 + INFRA_SMALL |
| ~10k consumer + 1k staff / S2 | ~**$700** B2C Essentials @10k (understates if B2B features needed) | $0 + INFRA_SMALL–MED | Auth0 ~**$300** B2B Essentials @1k + BA $0 + INFRA_SMALL–MED |
| ~100k consumer + 5k staff / S3 | **CUSTOM_QUOTE** (B2C Essentials published max ~50k) | $0 + INFRA_MED | Auth0 ~**$1,300** B2B Essentials @5k + BA $0 + INFRA_MED |
| ~1M consumer + 20k staff / S4 | **CUSTOM_QUOTE** | $0 + INFRA_LARGE | Auth0 ~**$3,800** B2B Essentials @20k (+ Contact us risk) + BA $0 + INFRA_LARGE |

**INFRA magnitudes (Better Auth / hybrid consumer leg):**  
- SMALL: shared Postgres + app (MVP order-of-magnitude tens of USD/mo if already paying for Sparelane DB).  
- MED: dedicated capacity, stronger rate-limit/email volume.  
- LARGE: multi-instance session DB, abuse tooling, on-call for auth incidents.  
Do not fabricate exact infra dollars without workload measurements.

## 13. TCO (qualitative)

| Factor | Auth0-all | Better Auth-all | Hybrid |
| --- | --- | --- | --- |
| Subscription | Scales with all MAU; CUSTOM_QUOTE at growth | License $0; infra+eng | Auth0 only on small privileged MAU |
| Eng integration | Already largely done | New MFA freshness design for admin | Consumer adapter + keep Auth0 |
| Security ownership | Vendor holds passwords/MFA | Sparelane holds all | Split by population |
| Enterprise federation | Strong | Extra work / managed SSO | Auth0 path retained for merchants |
| Dual-system tax | None | None | **High** (sessions, support, incidents) |
| Lock-in exit | Hard once consumers enrolled | Schema/plugin coupling | Consumers exit-friendly; privileged stay Auth0 |

## 14–15. Security models

**Auth0:** Managed credential store, Universal Login, MFA products, JWKS-verifiable tokens, `amr`/`auth_time` for Sparelane MFA derivation, vendor abuse tooling. Sparelane still owns BFF session after callback.

**Better Auth:** App-integrated auth; password hashing and 2FA secrets in Sparelane DB; session cookies; plugins for TOTP/backup/passkey. Sparelane owns patching, rate limits, recovery, breach response for that store. **No first-class Auth0-equivalent MFA time claim** for ADR-033 without Sparelane-owned `mfaSatisfiedAt`.

## 16–18. ADR-033 / step-up

| Requirement | Auth0 | Better Auth (admin) | Better Auth (consumer only) |
| --- | --- | --- | --- |
| MFA occurred | `amr` includes mfa | 2FA plugin challenge | N/A for ADR-033 |
| MFA time | `auth_time` | **Custom server field** after verified TOTP | N/A |
| Step-up | Auth0 step-up | Custom re-challenge + timestamp write | Product-only |
| Freshness ≠ session age | Bound in ADR-041 | Must not use session `updateAge` as MFA age | N/A |
| Client-controlled claims | Fail closed on unverified JWT | Fail closed; never trust client | Same |

**Hard-gate result:** Better Auth-all = **FAIL** for clean admin ADR-033 without significant custom security code. Hybrid = **PASS** (Auth0 retains privileged path). Auth0-all = **PASS**.

### Better Auth MFA-freshness design (only if ever used for privileged — NOT selected for admin)

Conceptual (not implemented):

1. On successful TOTP/passkey step-up, Sparelane writes server-side `mfaSatisfiedAt = now()` bound to session id + user id.
2. Privileged ops require `now - mfaSatisfiedAt ≤ 15m`.
3. Session refresh / `updateAge` must **not** mutate `mfaSatisfiedAt`.
4. Backup codes: may count as MFA **once** with audit; still set `mfaSatisfiedAt`.
5. Password-only login: **must not** set `mfaSatisfiedAt`.
6. Persist in Sparelane DB (not cookie).

Hybrid **does not** require this for MVP admin (Auth0 retained).

## 19–20. ExternalIdentity & authZ SoT

Prefer **preserve** `ExternalIdentity(issuer, subject)`. Better Auth user id maps as subject under Sparelane Better Auth issuer. Do not merge auth rows into business `User` casually. AuthZ remains Sparelane-only.

## 21–23. Population implications

- Consumer Auth0 MAU is the primary avoidable cost; Better Auth consumers address it.
- Merchant enterprise SSO stays on Auth0 trajectory.
- Admin security outweighs cost — Auth0 retained.

## 24. Hybrid analysis

**Benefits:** MAU isolation; keep ADR-033 native path; no production consumer migration later from Auth0.  
**Downsides:** Dual sessions/support/incidents — **material MVP complexity penalty**, still preferred vs failing admin MFA gate or CUSTOM_QUOTE consumer tax.  
**Verdict:** Sensible **now** because **no production consumers exist**; cheapest time to split populations.

## 25–26. Lock-in

**Auth0:** Password hashes/MFA enrollments/social/enterprise not easily portable; delaying consumer split until after enrollment makes exit worse.  
**Better Auth:** Schema/plugin coupling; mitigated by ExternalIdentity + AuthenticationProvider boundary.

## 27–29. Migration-now impact & sunk cost

Sunk Auth0 eng effort **excluded** from selection. Migration effort if Hybrid:

| Piece | Class |
| --- | --- |
| AuthenticationProvider, AuthenticatedSubject, ExternalIdentity, User, grants, memberships | REUSE |
| Auth0 adapter, privileged MFA, merchant/admin `/auth/*` | REUSE (narrow) |
| Consumer login/session | REPLACE with Better Auth |
| FakeAuth / tests / sandbox consumer Auth0 users | MODIFY / replace fixtures |
| Auth0 consumer LIVE_EVIDENCE as MVP blocker | REMOVE |

## 30. Security ownership matrix

| Responsibility | Auth0-all | Better Auth-all | Hybrid |
| --- | --- | --- | --- |
| Password hashing | Auth0 | Sparelane | Auth0 privileged / Sparelane consumer |
| MFA secrets | Auth0 | Sparelane | Auth0 privileged / Sparelane if consumer MFA later |
| Session security | Shared (Auth0 + BFF) | Sparelane | Split |
| Password reset | Auth0 | Sparelane + email | Split |
| Abuse prevention | Auth0 + Sparelane edge | Sparelane | Split |
| Identity federation | Auth0 | Sparelane/managed | Auth0 privileged |
| Step-up (ADR-033) | Auth0 + Sparelane derive | Sparelane custom | Auth0 + Sparelane derive |
| User business DB | Sparelane | Sparelane | Sparelane |
| Authorisation | Sparelane | Sparelane | Sparelane |
| Incident response | Vendor+Sparelane | Sparelane-heavy | Split by population |

## 31–35. Failure modes, privacy, availability, DX, support

| Mode | Auth0-all | Better Auth-all | Hybrid |
| --- | --- | --- | --- |
| IdP outage | All humans blocked | App/DB outage blocks | Privileged vs consumer partially isolated |
| Credential DB breach | Auth0 blast | Full Sparelane auth store | Consumer store vs Auth0 privileged |
| Email outage | Recovery impacted | Same | Same |
| Vendor suspension | Existential for Auth0-all | N/A license | Privileged only |

Privacy: Auth0 holds privileged identity PII externally; Better Auth holds consumer credentials in Sparelane DB (residency = Sparelane’s). No legal conclusions.

DX evidence: Auth0 live work hit audience grant + PKCE cookie issues — real ops complexity, mostly one-time. Better Auth: stronger Next/Prisma fit, higher security-ops ownership. Hybrid: worst DX (two stacks) — accepted trade.

Support: Auth0 absorbs more privileged recovery UX; Sparelane owns consumer recovery runbooks.

## 36. Enterprise trajectory

Auth0 orgs/SSO for merchants: available commercially. Better Auth SSO/SCIM via managed offerings — maturity/ops extra work. Hybrid keeps Auth0 for that trajectory.

## 37. Weighted scorecard

Weights: Security/MFA 25%, Unit economics 20%, Architecture fit 15%, Ops burden 15%, Consumer scale 10%, Merchant enterprise 5%, DX 5%, Migration/lock-in 5%.

| Criterion | Auth0-all | Better Auth-all | Hybrid |
| --- | ---: | ---: | ---: |
| Security / privileged MFA | 9 | 5 | 9 |
| Long-term unit economics | 3 | 9 | 8 |
| Architecture fit | 7 | 7 | 5 |
| Operational burden | 8 | 4 | 5 |
| Consumer scalability | 2 | 9 | 9 |
| Merchant enterprise | 9 | 4 | 9 |
| Developer experience | 5 | 7 | 4 |
| Migration / lock-in | 4 | 6 | 7 |
| **Weighted** | **6.20** | **6.45** | **7.25** |

## 38. Hard gates

| Gate | Auth0-all | Better Auth-all | Hybrid |
| --- | --- | --- | --- |
| Admin MFA + ≤15m freshness + server step-up | PASS | **FAIL** (no clean first-class evidence; significant custom code) | PASS |
| Fail-closed session / authZ separation | PASS | PASS if designed | PASS |
| Account recovery security | PASS | PASS with Sparelane ops | PASS (split) |
| MAU economics at consumer scale | **PENALIZE** | PASS | PASS |
| Dual-auth complexity | n/a | n/a | **PENALIZE** (still wins overall) |

## 39–40. Selection

**Selected: C — HYBRID_AUTH0_PRIVILEGED_BETTER_AUTH_CONSUMER**

Rejected A: consumer MAU CUSTOM_QUOTE trajectory is unreasonable long-term for Sparelane’s shape.  
Rejected B: fails clean ADR-033 admin hard gate without large custom security surface.

## 41–47. ADR / OD / MVP / migration

- ADR-042 Accepted; ADR-041 Superseded.
- OD-023 resolved under ADR-042 hybrid wording.
- OD-024: admin MFA still Auth0 implementation/evidence; not production-verified by this gate.
- MVP: stop requiring **consumer** Auth0 live evidence; require Better Auth consumer implementation + evidence; **keep** Auth0 merchant/admin MFA LIVE_EVIDENCE.
- Migration: NO_PRODUCTION_USER_MIGRATION_REQUIRED.
- Requirements: authentication.md + consumer Better Auth checklist; admin specs unchanged.

## 48–50. Docs / validation / git

See gate completion report in chat after `npm run validate` / portal / stock builds. No commit/push. Platform untouched.
