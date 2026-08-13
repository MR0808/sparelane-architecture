# Feature Flags

Use for controlled rollout of:

- wallet capability
- merchant pilots
- provider integrations
- future PayTo
- new recovery strategies

## Rules

- Financial behaviour flags must be **auditable** and **safely defaulted** (off/safe)
- Flags must **not** bypass authentication, authorisation, tenant isolation or PCI boundary
- Flag evaluation logged for sensitive payment/settlement paths where useful
