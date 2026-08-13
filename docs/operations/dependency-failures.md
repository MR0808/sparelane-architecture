# Dependency Failure Strategy

External providers and infrastructure are unreliable. Expected: timeouts, duplicate/delayed callbacks, temporary outage, partial failure.

## PSP unavailable

- new payment attempts may pause or fail temporarily
- do **not** duplicate requests on recovery without outcome checks
- apply queue buffering / backpressure
- surface status to operations and, where appropriate, merchants/consumers

## Settlement partner unavailable

- collected funds remain `COLLECTED`
- settlement remains pending / retryable
- **do not reverse** successful payment solely because settlement rail is unavailable

## KYC / KYB unavailable

- merchant onboarding pauses
- payment execution for existing approved merchants remains unaffected

## Email / SMS unavailable

- payment correctness continues
- notification delivery retries; may DLQ after bounds

## Analytics unavailable

- payment, ledger and settlement processing continues
- reporting lags or pauses

## Identity provider unavailable

- new login may degrade or fail
- behaviour of already-issued sessions **TBD** (session validation strategy depends on IdP design)

## Database unavailable

- fail safely
- **do not** execute financial actions if authoritative state cannot be safely read/written
