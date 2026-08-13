# Money Representation

## Canonical rules

- **Never** use binary floating point (`float` / `double`) for money
- API amounts use **decimal strings** with ISO 4217 currency codes
- Database stores **integer minor units** (e.g. cents for AUD) + `currency` text

### API (Proposed)

```json
{
  "value": "150.00",
  "currency": "AUD"
}
```

### Database (Recommended)

| Column | Type | Example |
| --- | --- | --- |
| `amount_minor` | `BIGINT` | `15000` for AUD 150.00 |
| `currency` | `CHAR(3)` / text | `AUD` |

## Tradeoff

| Approach | Pros | Cons |
| --- | --- | --- |
| Integer minor units | Exact arithmetic; simple constraints | Exotic currencies / non-decimal units need exponent table |
| Fixed-precision `NUMERIC` | Flexible scale | Easier to misuse; still OK if float forbidden |

**Decision:** integer minor units for MVP currencies with known exponents (AUD=2). Maintain a currency exponent map in domain logic. Revisit if multi-currency edge cases expand.

See [ADR-021](../decisions/ADR-021-money-representation.md).
