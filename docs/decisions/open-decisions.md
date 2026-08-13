# Open Decisions

Unresolved items that are **not** Accepted ADRs. Organised separately from vendor-neutral architecture decisions.

Implementation phase detail: [`docs/implementation/build-phases.md`](../implementation/build-phases.md).

---

## Blocker summary

### Non-blocking for development

Local/CI can proceed with fakes/stubs and safe product defaults:

- Consumer notification rules/copy
- Multi-workflow-per-bill (deferred)
- Settlement schedule/batching rules
- Observability/SIEM vendors
- Dual-control / break-glass (not MVP core)
- PostgreSQL RLS vs app-only tenancy (app isolation mandatory)
- OAuth/mTLS enterprise merchant API
- Numeric rate limit values
- Public ID prefix spelling
- Payment-attempt merchant API visibility
- Webhook endpoint management via API

### Soft / partial (need defaults; not hard stop)

- Retry timing/windows/maxima/quiet hours
- Backup cardinality / wallet ordering
- Wallet product rules (tables optional)
- Idempotency key retention TTL
- Webhook retry schedule bounds
- Outbox publish mechanism (polling vs CDC)
- Cloud / worker runtime / DB topology (local can proceed)
- Legal retention durations (hooks can be built)

### Blocks sandbox (live provider rails)

- **PSP selection** (+ sandbox credentials) for live card sandbox
- **Settlement / banking partner** for live payout sandbox
- **Identity provider** for real shared sandbox sessions (dev auth OK for local)

### Blocks pilot

- PSP + **provider capability matrix** (pre-auth, idempotency keys)
- Settlement partner for pilot payouts
- Secrets manager product (pattern Accepted; product TBD)
- Admin MFA / passkey approach
- Due-date local capture clock default + merchant timezone-change policy

### Blocks production money movement

1. PSP + settlement partner (live)
2. Identity provider + admin MFA
3. Secrets manager / KMS product
4. Queue/broker + DB hosting topology
5. Legal retention periods (+ PCI validation program with chosen PSP method)
6. Due-date clock + timezone-change policy

### Blocks wallet only

- Wallet custody / safeguarding / licensing — **not** required for non-wallet MVP

---

## Product

| Decision required | Why it matters | Blocking? | Target / dependency |
| --- | --- | --- | --- |
| Exact retry timing, windows, maxima, quiet hours | Shapes Retry Service configuration | Partial — need defaults to ship recovery | Payment product config |
| Exact due-date local capture clock time | Converts date-only due dates to UTC schedule instants | Partial — timezone semantics Accepted; clock TBD | [due-dates.md](../contracts/due-dates.md) |
| Payment-method backup cardinality / wallet ordering | Reliability Engine inputs | Partial — ordered preference required; counts TBD | Method selection docs |
| Wallet product rules (enablement, funding, spend) | Optional MVP capability boundaries | Partial — wallet tables optional | Wallet / regulatory |
| Consumer notification rules and copy | Notification worker behaviour | No | Notifications product |
| Merchant timezone change handling policy | Prevents silent reschedule of in-flight bills | Partial | due-dates.md |
| Multi-workflow-per-bill (future) | Must not be built in MVP | No — explicitly deferred | Future ADR if needed |

---

## Payments / Banking

| Decision required | Why it matters | Blocking? | Target / dependency |
| --- | --- | --- | --- |
| PSP selection | Tokenisation, auth/capture, webhooks | Partial — adapters can be stubbed; live rails need PSP | External provider |
| Settlement / banking partner | Payout rails, confirmation events | Partial — settlement worker can be built against interfaces | External partner |
| Provider capability matrix (pre-auth, idempotency keys) | Orchestrator/adapter behaviour | Partial | After PSP choice |
| Settlement schedule / batching rules | Settlement worker batching | No | Partner + product |

---

## Regulatory

| Decision required | Why it matters | Blocking? | Target / dependency |
| --- | --- | --- | --- |
| Wallet custody / safeguarding / licensing | Whether wallet is live in a jurisdiction | Yes for **wallet go-live**; No for non-wallet MVP | Legal/compliance |
| PCI validation approach / SAQ level | Depends on PSP integration method | Partial — architecture forbids CHD; validation program TBD | After PSP + integration method |
| Legal data retention periods | Retention categories exist; durations TBD | Partial — can implement soft-delete/archive hooks | Legal |
| KYC/KYB evidence retention | Object storage lifecycle | Partial | Provider + legal |

---

## Infrastructure

| Decision required | Why it matters | Blocking? | Target / dependency |
| --- | --- | --- | --- |
| Cloud provider | Hosting | Partial — local/dev can proceed | Ops |
| Queue / event broker | Event Bus implementation | Partial — outbox pattern Accepted; broker TBD | ADR-016/017 |
| Outbox publish mechanism (polling vs CDC) | Outbox Processor implementation | Partial | ADR-016 |
| Physical DB topology (shared vs separate ledger DB) | Deployment | Partial — logical separation Accepted | ADR-013/016 |
| Worker runtime (K8s/ECS/serverless/…) | Deployables | Partial | ADR-018 |
| Observability / SIEM vendors | Ops tooling | No | Ops |
| Regions / HA / numeric RPO-RTO | DR | Partial — sensitivity tiers Accepted | DR docs |

---

## Security

| Decision required | Why it matters | Blocking? | Target / dependency |
| --- | --- | --- | --- |
| Identity provider | Consumer/merchant/admin auth | Partial — auth surfaces Accepted | Authn docs |
| MFA / passkey implementation | Admin/consumer assurance | Partial for admin go-live | Admin access |
| Secrets product / KMS/HSM | Implements ADR-011 | Partial — pattern Accepted | ADR-011 |
| Dual-control / break-glass workflows | Privileged financial actions | No for MVP core; needed for some ops | Admin security |
| PostgreSQL RLS vs app-only tenancy | Defence in depth | No — app enforcement mandatory | ADR-014 |
| OAuth/mTLS for enterprise merchant API | Auth alternatives | No | API auth TBD |

---

## API

| Decision required | Why it matters | Blocking? | Target / dependency |
| --- | --- | --- | --- |
| Numeric rate limits | Edge protection | No — rate limiting capability required | Operations |
| Idempotency key retention | Storage TTL | Partial | ADR-008 |
| Webhook retry schedule / attempt bounds | Delivery worker | Partial — bounded retry required | ADR-009 |
| Public ID prefix final spelling | Cosmetic if opacity preserved | No | ADR-020 |
| Payment-attempt merchant API visibility | Future endpoint | No | OpenAPI deferred |
| Webhook endpoint management via API | Portal-managed for now | No | Integrations |

---

## Highest-priority before production cutover

1. PSP + settlement partner selection (live money movement)
2. Identity provider + admin MFA
3. Secrets manager product
4. Queue/broker + DB hosting topology
5. Legal retention + wallet regulatory posture (if wallet enabled)
6. Due-date local clock default + timezone-change policy
