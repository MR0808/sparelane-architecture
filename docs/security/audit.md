# Audit Architecture

The Audit Service records security-relevant and financially sensitive actions in a durable Audit Store.

## Events that should be audited (conceptual)

- login / security events (success and material failure where useful)
- credential issuance / rotation / revocation
- admin actions
- merchant configuration changes (webhooks, integration mode, etc.)
- payment-sensitive actions
- settlement-sensitive actions
- manual replay / retry actions by authorised operators
- role / permission changes

## Audit record fields (conceptual)

| Field | Purpose |
| --- | --- |
| Actor | Who initiated the action (user, service, system) |
| Action | What was attempted |
| Target | Object/resource affected |
| Timestamp | When |
| Context | Environment, IP/device metadata where appropriate |
| Result | Success / deny / failure |
| Correlation / reference IDs | Link to bill, workflow, settlement, webhook event, etc. |

## Sensitivity rules

- do **not** log secrets, raw API keys, webhook signing secrets, passwords, session tokens or raw payment credentials
- do **not** log PAN/CVV (Sparelane should not possess them)
- minimise personal data in audit payloads; prefer identifiers and references

Audit retention, immutability technology and SIEM integration remain TBD.
