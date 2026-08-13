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

## Application handling

Services retrieve secrets at runtime from the secrets capability. Configuration files and repositories may contain non-secret references/names only.
