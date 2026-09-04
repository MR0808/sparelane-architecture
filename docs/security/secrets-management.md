# Secrets Management

Production secrets are managed centrally per [ADR-011](../decisions/ADR-011-centralised-secrets-management.md) and [ADR-040](../decisions/ADR-040-mvp-managed-secrets-and-key-management-policy.md).

## Secret categories

- PSP / settlement credentials (Stripe Connect — ADR-038/039)
- merchant webhook signing secrets (recoverable)
- API credential pepper (hashes of issued keys only in DB)
- email / SMS provider credentials (vendor OD-035)
- KYC / KYB provider credentials (when selected)
- database / broker credentials (deployment secrets)
- identity/session / Better Auth application secrets ([ADR-043](../decisions/ADR-043-unified-better-auth-human-authentication.md); ADR-040 managed secrets). Auth0 client secrets are **not** target-architecture requirements (AUTH-B6 removal).

## MVP backends (ADR-040)

| Class | Backend |
| --- | --- |
| Low-cardinality provider / deployment / pepper | AWS Secrets Manager + CMK |
| High-cardinality recoverable (webhook signing) | Postgres ciphertext + AWS KMS envelope |
| Non-recoverable API credential secrets | HMAC hash + pepper only |
| Public identifiers (`acct_…`, `ba_…`, `po_…`) | Ordinary DB |

## Principles

- no secrets committed to source control
- central managed secret store (split architecture)
- least-privilege workload identity (no static AWS access keys in app config)
- environment separation (sandbox vs production CMK + namespaces)
- rotation capability (operator/runbook for MVP; pepper versioning deferred)
- audit of secret access (CloudTrail + application audit for webhook refs)
- never log secret values in application logs, traces or analytics
- Merchant API plaintext secrets are shown once at issuance; thereafter only hashes/references are stored
- Merchant **webhook signing** secrets are shown once at issuance; thereafter a **recoverable** `signing_secret_ref` is stored (HMAC requires the raw key — not a one-way hash). Rotation deferred from G0/G1 ([ADR-030](../decisions/ADR-030-merchant-webhook-contract-signing-and-delivery.md))
- Sandbox/production: **fail closed** without managed backends — no MemorySecretStore / local-master-key sole store

## Application handling

Services retrieve secrets at runtime via `SecretProvider` / `RecoverableSecretStore`. Configuration files and repositories may contain non-secret references/names only.

## Checklists

- [managed-secrets-backend-checklist.md](../implementation/managed-secrets-backend-checklist.md)
- [stripe-connect-adapter-checklist.md](../implementation/stripe-connect-adapter-checklist.md)
- [stripe-connect-settlement-adapter-checklist.md](../implementation/stripe-connect-settlement-adapter-checklist.md)
