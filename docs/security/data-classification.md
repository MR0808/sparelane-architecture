# Data Classification

Practical data classification for Sparelane architecture. Classifications guide access control, logging, retention and handling — not final legal data inventories.

## Public

Information intended for unrestricted disclosure.

Examples:

- public product/marketing content
- public documentation
- published status pages (when used)

## Internal

Non-public operational information with limited sensitivity.

Examples:

- non-sensitive operational metadata
- internal architecture documentation
- aggregated non-identifying operational metrics (where not otherwise restricted)

## Confidential

Business and personal data requiring controlled access and tenant isolation.

Examples:

- consumer profile data
- merchant organisation data
- integration configuration (endpoints, modes, non-secret settings)
- payment workflow metadata
- bill references and amounts
- connection references
- notification content metadata

## Restricted

Highest sensitivity within Sparelane-controlled systems.

Examples:

- authentication secrets and session material
- Better Auth password hashes; encrypted TOTP secrets / backup codes
- Sparelane AuthenticationAssurance records (session-scoped MFA timestamps)
- API key material (hashes/references; plaintext only at one-time issuance)
- webhook signing secrets
- financial ledger data
- settlement data and instructions
- KYC/KYB evidence and verification outcomes
- privileged admin audit detail and privileged role assignments
- production credentials for PSP, banking, email/SMS and KYC providers

## PCI-sensitive external data

Raw cardholder data that must remain inside the PCI-compliant payment provider boundary:

- raw PAN
- CVV
- secure card-entry field contents before tokenisation

**Sparelane application systems must not store raw PAN/CVV.**

Sparelane must never intentionally receive or persist CVV.

Final PCI scope depends on the selected integration method and provider architecture. Do not claim a PCI SAQ level in this repository yet.

## Component mapping (indicative)

| Component | Typical classification of primary data |
| --- | --- |
| Consumer Web / Merchant Portal content | Public–Confidential |
| Merchant API / Integration config | Confidential–Restricted |
| Merchant API Key Management | Restricted |
| Payment Method Service (token refs) | Confidential–Restricted |
| Payment Orchestrator / Attempt Service | Confidential–Restricted |
| Double-entry Ledger / Ledger DB | Restricted |
| Settlement services | Restricted |
| Audit Store | Restricted |
| Secrets Management | Restricted |
| PSP Card Tokenisation | PCI-sensitive (external) |
| Operational DB (excl. secrets/PAN) | Confidential–Restricted by table/field |
