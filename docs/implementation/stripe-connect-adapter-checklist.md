# Platform checklist — Stripe Connect PaymentProvider adapter

**Status:** Architecture-only (no code in this track)  
**Binding:** [ADR-038](../decisions/ADR-038-mvp-payment-service-provider-selection.md)

## Location

- Interface remains `packages/integrations` `PaymentProvider`
- Adapter module e.g. `packages/integrations/src/stripe/` or `modules/integrations/stripe-payment/` — **no Stripe SDK types in domain modules**
- Map Stripe responses → closed Sparelane taxonomies only

## Must implement

| Item | Notes |
| --- | --- |
| Credential resolver | Via future SecretProvider (OD-025); never env hardcode in production |
| Connected account context | `merchantContext.providerAccountRef` = `acct_…`; fail closed if missing/live |
| Token handling | Platform `pm_…`; clone to connected account before direct charge |
| `executePayment` | Create+confirm PaymentIntent on connected account; auto-capture; `off_session` |
| Outcome mapping | success / declined / technical_error / unknown_outcome / ACTION_REQUIRED path |
| `lookupTransaction` | Retrieve by `pi_…` + Stripe-Account; identical Idempotency-Key re-POST when needed |
| Webhook verify | Optional `verifyProviderEvent` + `whsec_` |
| Conformance suite | Existing `assertPaymentProviderContract` + Stripe test-mode scenarios |
| Sandbox scenarios | Success, decline, clone, connected account, idempotent replay, retrieve, auth-required |
| Production Fake guard | `assertProductionSafePaymentProvider` — reject Fake in sandbox/production |
| Safe logging | No PAN/CVV/sk_/whsec_/full client_secret in durable logs |

## Must not

- Destination charges / separate charges+transfers for MVP collection
- Net ADR-026 journals with application fees
- New idempotency key on conflict/timeout
- Leak raw Stripe status enums into core domain
- Read `providerAccountRef` from bill/consumer/headers
