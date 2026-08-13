# Merchant Identifiers

Identifier categories used across merchant integration, payment reliability and settlement.

Exact formats (UUID vs opaque token) are TBD unless already decided elsewhere.

## Merchant-originated

| Identifier | Meaning |
|---|---|
| `merchantId` | Sparelane-assigned merchant organisation context (returned to merchant; originates in Sparelane but identifies merchant) |
| `merchantCustomerReference` | Merchant's own customer/account reference |
| `merchantBillReference` | Merchant's bill/invoice identifier used for correlation |
| `merchantReconciliationReference` | Merchant reference used to match settlement/reporting back into merchant finance |

Merchant-provided references should be preserved for reconciliation and reporting.

## Sparelane-originated

| Identifier | Meaning |
|---|---|
| `sparelaneConnectionId` | Sparelane connection between merchant customer and consumer |
| `sparelaneBillId` | Sparelane bill projection ID |
| `paymentWorkflowId` | Sparelane payment reliability workflow ID |
| `settlementId` | Sparelane settlement obligation ID |

## Correlation expectation

Merchants and Sparelane must be able to join:

```text
merchantBillReference
↔ sparelaneBillId
↔ paymentWorkflowId
↔ settlementId
↔ merchantReconciliationReference
```

Public API and webhook payloads should include the correlation identifiers needed for merchant systems without exposing unnecessary internal storage keys.

See also [identifier strategy](../schema/identifier-strategy.md) for opaque public ID prefixes and internal PK conventions.
