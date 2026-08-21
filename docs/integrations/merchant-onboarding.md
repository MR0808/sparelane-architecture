# Merchant Onboarding

Conceptual merchant onboarding and go-live path.

```text
Merchant applies
→ organisation created
→ business verification
→ integration configured
→ credentials issued
→ webhook configured
→ sandbox / testing
→ approval
→ live
```

## Notes

- Business verification uses the external KYC/KYB provider.
- Settlement eligibility requires separate capability **`APPROVED_FOR_SETTLEMENT`** in addition to operational merchant status ([ADR-027](../decisions/ADR-027-settlement-obligation-eligibility-cardinality.md)). Local/test may use a fake verification provider; production fails closed without approval.
- Integration configuration is owned by Merchant Integration Service (hosted/widget/API/webhooks).
- Credentials are issued by Merchant API Key Management with one-time secret display and hashed storage.
- Sandbox and live are logically isolated contexts.
- Final compliance approval mechanics and required evidence remain TBD ([OD-015](../decisions/open/OD-015-kyb-evidence-retention.md)).

Sparelane does not replace the merchant billing platform during or after onboarding.
