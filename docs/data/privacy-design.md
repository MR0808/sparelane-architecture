# Privacy Design Principles

Architecture principles for privacy and data minimisation. **Not legal advice.** Final obligations require legal/compliance input.

## Data minimisation

Store only information required for:

- account operation
- payment reliability
- settlement
- reconciliation
- security
- regulatory/business obligations

## Purpose limitation

Derived analytics must not automatically gain broader access to Restricted data. Purpose-specific access controls apply.

## Sensitive data reduction

Prefer references and tokens over sensitive source data. Prefer merchant/Sparelane IDs over copying full merchant customer masters.

## Separation

- PCI data (raw PAN/CVV) remains external
- KYC/KYB evidence remains access-restricted
- Audit, operational and analytics stores remain conceptually separate

## Logging

Logs must not contain:

- secrets
- API keys
- CVV
- raw PAN
- authentication tokens

Avoid unnecessary personal information in logs and traces.
