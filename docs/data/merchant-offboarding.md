# Merchant Offboarding (Conceptual)

```text
Merchant termination
→ disable new bill ingestion
→ revoke API credentials
→ disable webhook delivery where appropriate
→ resolve in-flight payment workflows
→ resolve pending settlements
→ preserve required reconciliation/audit history
→ archive/delete eligible configuration
```

## Hard rule

Merchant offboarding must **not** destroy financial history (ledger journals, required settlement/reconciliation records) or required audit evidence.

Eligible integration configuration and secrets may be revoked/archived/deleted per policy (**TBD**).
