# Secrets Management

Production secrets are managed centrally. Vendor remains TBD (see ADR-011).

## Secret categories

- PSP credentials
- banking / settlement partner credentials
- merchant webhook signing secrets
- API signing / encryption keys
- email / SMS provider credentials
- KYC / KYB provider credentials
- database credentials
- identity/session signing material where applicable

## Principles

- no secrets committed to source control
- central managed secret store
- least-privilege access to secrets
- environment separation (sandbox vs live at minimum)
- rotation capability
- audit of secret access where the platform supports it
- never log secret values in application logs, traces or analytics
- Merchant API plaintext secrets are shown once at issuance; thereafter only hashes/references are stored
- Merchant **webhook signing** secrets are shown once at issuance; thereafter a **recoverable** secrets-manager / SecretProvider reference is stored (HMAC requires the raw key — not a one-way hash). Rotation deferred from G0/G1 ([ADR-030](../decisions/ADR-030-merchant-webhook-contract-signing-and-delivery.md))

## Application handling

Services retrieve secrets at runtime from the secrets capability. Configuration files and repositories may contain non-secret references/names only.
