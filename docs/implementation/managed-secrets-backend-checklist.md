# Platform checklist — managed secret backends (ADR-040)

**Status:** Architecture-only (no code in this track)  
**Binding:** [ADR-040](../decisions/ADR-040-mvp-managed-secrets-and-key-management-policy.md)

## Location

- Ports: `@sparelane/config` `SecretProvider` / `RecoverableSecretStore`
- Composition: `composeRecoverableSecretStore` — replace FailClosed for sandbox/production
- Adapters: integrations/config infra packages — **no AWS SDK types in domain**

## Must implement

| Item | Notes |
| --- | --- |
| AwsSecretsManagerSecretProvider | get (put/delete for ops tooling as needed) |
| KmsEnvelopePostgresRecoverableSecretStore | AES-GCM data key + KMS wrap; encryption context |
| Namespace routing | webhook refs → envelope DB; stripe/pepper/idp/email → Secrets Manager |
| Workload IAM | Task roles; no static AWS keys in app config |
| Separate sandbox vs production CMK + secret namespace | Hard separation |
| Process-memory cache | Bounded TTL; no disk; no value logs |
| Fail closed | assertRecoverableSecretStoreAllowed; reject Memory in sandbox/prod |
| Local/test unchanged | Postgres local envelope + LOCAL_SECRETS_MASTER_KEY |
| CloudTrail | Enable Secrets Manager + KMS data events |
| Conformance | missing secret → fail; wrong env CMK → fail; no unsigned webhook |

## Must not

- Use MemorySecretStore or local master key as production sole store
- Persist Stripe `sk_` / `whsec_` in operational plaintext columns
- Log secret values / ARNs in routine metrics labels
- Expose AWS types to money domain modules
