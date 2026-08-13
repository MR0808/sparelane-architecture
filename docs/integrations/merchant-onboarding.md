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
- Integration configuration is owned by Merchant Integration Service (hosted/widget/API/webhooks).
- Credentials are issued by Merchant API Key Management with one-time secret display and hashed storage.
- Sandbox and live are logically isolated contexts.
- Final compliance approval mechanics and required evidence remain TBD.

Sparelane does not replace the merchant billing platform during or after onboarding.
