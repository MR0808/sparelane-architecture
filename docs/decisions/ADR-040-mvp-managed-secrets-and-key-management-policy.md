---
id: ADR-040
title: MVP Managed Secrets and Key Management Policy
status: Accepted
date: 2026-08-25
deciders: Architecture
consulted: Security / Ops / Integrations
informed: Platform engineering / Product
supersedes: []
related:
  - ADR-011
  - ADR-030
  - ADR-033
  - ADR-037
  - ADR-038
  - ADR-039
  - OD-025
  - OD-016
  - OD-023
  - OD-035
---

# ADR-040 — MVP Managed Secrets and Key Management Policy

## Status

**Accepted**

Resolves [OD-025](./open/OD-025-secrets-kms.md). Implements [ADR-011](./ADR-011-centralised-secrets-management.md) vendor selection for MVP sandbox/production. Does **not** implement backends, does **not** resolve [OD-023](./open/OD-023-identity-provider.md), and does **not** claim live secret wiring evidence.

**Research access date:** 2026-08-25 (AWS Secrets Manager / Parameter Store / KMS guidance; platform SecretProvider evidence).

## Context

Platform already defines:

- `SecretProvider` / `RecoverableSecretStore` (`get` / `put` / optional `delete`)
- local/test durable Postgres AES-GCM envelope (`LocalApplicationSecret`) via `LOCAL_SECRETS_MASTER_KEY`
- sandbox/production **FailClosedSecretStore** until OD-025
- production rejection of `MemorySecretStore`

ADR-038/039 require Stripe platform keys and webhook secrets for PaymentProvider + SettlementProvider. ADR-030 requires recoverable merchant webhook signing secrets at high cardinality.

## Decision

### Selected architecture — **SPLIT**

| Secret class | Backend |
| --- | --- |
| **LOW_CARDINALITY** provider / deployment / pepper secrets | **AWS Secrets Manager** encrypted with **customer-managed KMS CMK** |
| **HIGH_CARDINALITY** recoverable application secrets (merchant webhook signing) | **Postgres ciphertext** + **AWS KMS envelope encryption** (CMK); opaque logical ref on row |
| **NON_RECOVERABLE_HASH** | Hash only in operational DB (never recoverable store) |
| **PUBLIC_IDENTIFIER** | Ordinary DB / config (not a secret store) |
| **OUT_OF_SCOPE** | Not stored by Sparelane application secret layer |

Rejected as sole MVP pattern:

| Option | Verdict |
| --- | --- |
| A Secrets Manager only | Rejected for high-cardinality merchant webhook secrets (cost/ops/API limits) |
| B SSM Parameter Store + KMS only | Rejected as primary for provider credentials needing rotation/version semantics |
| C HashiCorp Vault / HCP Vault | Rejected for MVP — extra ops plane; AWS-native fit preferred |
| D Deployment-injected secrets only | Rejected — insufficient for app-generated recoverable secrets + rotation/audit |
| Parameter Store for Stripe keys | Soft-reject — Secrets Manager preferred for credential lifecycle |

### Cloud assumption (narrows OD-016; does not close it)

MVP sandbox/production **money-path secrets require an AWS account** with Secrets Manager + KMS reachable from all money/auth deployables via workload identity.

[OD-016](./open/OD-016-cloud-provider.md) remains **open** for broader hosting. If OD-016 selects a non-AWS primary cloud, this ADR must be superseded or dual-homed before production cutover.

## Secret inventory (binding)

| Item | Class | Backend |
| --- | --- | --- |
| Stripe platform secret key `sk_test_` / `sk_live_` | LOW_CARDINALITY / RECOVERABLE_APPLICATION_SECRET (provider) | Secrets Manager |
| Stripe publishable key `pk_…` | LOW_CARDINALITY (treat as confidential config; not CHD) | Secrets Manager **or** non-secret config store — **must not** be treated as unrestricted public marketing copy in logs |
| Stripe payment webhook `whsec_…` | LOW_CARDINALITY | Secrets Manager |
| Stripe payout webhook `whsec_…` | LOW_CARDINALITY | Secrets Manager |
| Stripe Connect OAuth / client secret (if used) | LOW_CARDINALITY | Secrets Manager |
| Connected account `acct_…` | **PUBLIC_IDENTIFIER** (merchant config) | Ordinary DB — **not** Secrets Manager |
| External bank `ba_…` / payout `po_…` | PUBLIC_IDENTIFIER / provider refs | Ordinary DB |
| Merchant webhook signing secret | HIGH_CARDINALITY RECOVERABLE | KMS-envelope Postgres + `signing_secret_ref` |
| Merchant API issued key (raw) | Shown once; then discarded | — |
| Merchant API `secretHash` | **NON_RECOVERABLE_HASH** | Operational DB |
| API credential pepper | LOW_CARDINALITY | Secrets Manager |
| Future IdP client secret / IdP webhook secret | LOW_CARDINALITY | Secrets Manager (compatible; vendor open OD-023) |
| Session/auth signing material (if app-owned) | LOW_CARDINALITY | Secrets Manager |
| Email provider API credential | LOW_CARDINALITY | Secrets Manager (OD-035 vendor open) |
| `DATABASE_URL`, broker/cache passwords | **DEPLOYMENT_SECRET** | Secrets Manager (or injection **sourced from** Secrets Manager) |
| Local `LOCAL_SECRETS_MASTER_KEY` | Local-only | Env — **forbidden** as sole sandbox/production store |
| KMS CMK material | OUT_OF_SCOPE for app storage | AWS KMS only |

## SecretProvider contract

Keep platform ports:

```text
SecretProvider.getSecret(name)
RecoverableSecretStore.putSecret(name, value)
RecoverableSecretStore.deleteSecret?(name)
```

Optional bounded metadata/version on adapter — **not** required in domain.

**Must not** expose AWS SDK types into domain modules. Adapters live under integrations/config infrastructure packages.

Composition (sandbox/production):

1. `AwsSecretsManagerSecretProvider` for named low-cardinality secrets
2. `KmsEnvelopePostgresRecoverableSecretStore` for high-cardinality recoverable secrets
3. Facade/`composeRecoverableSecretStore` routes by name prefix or explicit namespace (e.g. `webhook:…` → envelope DB; `stripe:…` / `pepper:…` → Secrets Manager)

Local/test/development: existing Postgres local envelope + `LOCAL_SECRETS_MASTER_KEY` (or Memory for pure unit tests only).

## Secret references

| Layer | Binding |
| --- | --- |
| Application rows | Opaque logical refs only (e.g. `webhook:{endpointPublicId}` or stable UUID ref) |
| Infrastructure ARNs | Adapter-internal mapping; **not** required on public merchant API rows |
| No plaintext | Never store recoverable secret values in operational tables outside ciphertext columns |

## KMS model

| Setting | Binding |
| --- | --- |
| Key type | **Customer-managed CMK** (symmetric) per environment |
| Environments | Separate CMKs (and Secrets Manager namespaces) for **sandbox** vs **production** |
| Region | Single primary region for MVP (AU-oriented residency preference: e.g. `ap-southeast-2` when AWS account placed there) — exact region follows account placement; **no** multi-region secret replication required for MVP |
| Rotation | AWS KMS automatic annual rotation **enabled** for CMKs |
| Deletion | Deletion protection / waiting period; no casual schedule-delete in production |
| Encryption context | Required on envelope decrypt/encrypt — at minimum `env`, `purpose`, and tenant/merchant key where applicable (`merchant_public_id` for webhook secrets) |
| Audit | CloudTrail data events for KMS + Secrets Manager |

No raw CMK key material in application config. Key IDs/ARNs are infrastructure config only.

## IAM / workload identity

| Rule | Binding |
| --- | --- |
| AuthN to AWS | **Workload identity / task role / instance role** — no static AWS access keys in application config |
| Least privilege | Per deployable; separate roles for API, payment-worker, settlement-worker, notification-worker, scheduler |
| Stripe secrets | Readable by API (webhook verify ingress), payment-worker, settlement-worker as needed |
| Merchant webhook ciphertext + KMS decrypt | API (create/rotate) + notification-worker (sign/deliver); not web browser roles |
| Pepper | Readable by API (credential verify) only among app roles |
| Put/Delete | Narrow write roles; human break-glass via audited IAM, not app default |

## Deployables needing secret access

| Deployable | Typical secrets |
| --- | --- |
| API | Pepper, Stripe webhook secrets, Stripe sk (ingress/admin ops), webhook put/get, IdP (future) |
| payment-worker | Stripe `sk_…` |
| settlement-worker | Stripe `sk_…` |
| notification-worker | Merchant webhook recoverable secrets; email credential (future) |
| scheduler | Usually none of Stripe/webhook — avoid broad secret grants |
| web / admin BFF | Prefer **no** direct Secrets Manager; call API |
| outbox processor | Prefer none |

## Caching

Process-memory cache **allowed** for SecretProvider gets:

- bounded TTL (adapter-configured; default minutes-scale)
- no disk cache
- version/AWSCURRENT-aware invalidation where applicable
- never log values; metrics without secret IDs/ARNs

## Rotation (MVP minimum)

| Secret | MVP policy |
| --- | --- |
| Stripe API keys | Operator/runbook rotate in Stripe + update Secrets Manager version; dual-read AWSCURRENT during cutover |
| Stripe webhook secrets | Operator rotate endpoint secret + Secrets Manager; short dual-verify window if needed |
| Merchant webhook secrets | Product/API rotation deferred from G0/G1 (ADR-030) — when added: put new version, update ref, revoke old |
| API pepper | **Do not casually rotate.** MVP: single pepper; versioned multi-pepper **deferred** (would require rehash or dual-verify design ADR) |
| KMS CMK | Automatic rotation enabled |
| UI | No merchant/admin secret-manager UI required for MVP |

## Failure / fallback (sandbox + production)

**FAIL CLOSED** on secret retrieval / decrypt / missing ref.

Explicitly **prohibit**:

- `MemorySecretStore` fallback
- `LOCAL_SECRETS_MASTER_KEY` / local Postgres envelope as sole production store
- hardcoded defaults
- checked-in `.env` secrets for sandbox/production runtime
- unsigned merchant webhook delivery
- Stripe provider calls without credentials
- silent degrade to Fake providers

## Environments

| Env | Binding |
| --- | --- |
| local / development / test | Local envelope + env; Memory unit-test only |
| **sandbox** | **Real** AWS Secrets Manager + KMS envelope architecture; Stripe **test** credentials; separate AWS account or hard-separated namespace/CMK from production |
| **production** | Same architecture; live credentials; isolated CMK + secret namespace |

No sharing production secrets with sandbox.

## Audit / security / metrics

- Application audit for merchant webhook secret create/rotate/delete (ref only; no values) per ADR-012/030
- CloudTrail for Secrets Manager + KMS API access
- Security signals: decrypt failures, cross-tenant encryption-context mismatch, secret_provider_unavailable spikes
- Metrics: latency/error counts by secret **class** — never secret name values, ARNs, or plaintext
- No routine secret values in logs, traces, analytics, DLQ, outbox

## Disaster recovery

Redeploy/restart recovers secrets from Secrets Manager + DB ciphertext + KMS (same region). No plaintext secret backup exports. No invented RTO/RPO (OD-022 open).

## Stripe handling

| Requirement | Binding |
| --- | --- |
| Platform `sk_…` | Secrets Manager; resolved by payment + settlement adapters via SecretProvider |
| `pk_…` | Secrets Manager or confidential config; client-safe distribution only |
| Payment / payout `whsec_…` | Secrets Manager; API ingress verification |
| `acct_…` | Merchant config DB only |
| Raw keys in operational tables | **Forbidden** |

## Merchant webhook handling

High-cardinality recoverable secrets use KMS-envelope Postgres (production table successor to `local_application_secrets`). `signing_secret_ref` remains opaque. Create sequence unchanged: put → insert row → best-effort delete on failure. Delivery without secret → fail closed (no unsigned HTTP).

## Pepper handling

Pepper in Secrets Manager. Verification uses current pepper only for MVP. Pepper rotation that invalidates all hashes is **out of MVP** unless a later ADR defines versioned peppers.

## Future IdP / email

Same low-cardinality Secrets Manager path. Selecting Auth0/Cognito/etc. (OD-023) or email vendor (OD-035) does not require a new secrets product — only new secret names + IAM grants.

## Consequences

### Positive

- OD-025 closed with scalable split matching platform ports
- Stripe + webhook + pepper paths bound
- Sandbox uses real managed architecture (not Fake)
- Fail-closed preserved

### Negative / follow-ups

- Managed-secret backends = **EXTERNAL_IMPLEMENTATION**
- OD-016 narrowed toward AWS for money-path secrets
- Pepper versioning deferred
- OD-023 / OD-035 still open for vendors
- CMK/account regional placement ops work

## Alternatives considered

1. **STOP for OD-016** — rejected; secrets product can bind AWS assumption while cloud hosting OD remains open (same pattern as Stripe before full infra freeze).
2. **Secrets Manager per merchant webhook** — rejected on cardinality/cost/ops.
3. **Vault** — rejected for MVP operational burden.
4. **Deployment-only env injection** — rejected for recoverable app-generated secrets.
