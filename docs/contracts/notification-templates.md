# Consumer notification templates (G2)

Binding template contract for platform G2. Final marketing/legal copy may evolve; **template IDs, versions, channels, and variable whitelist are frozen**.

Authority: [ADR-031](../decisions/ADR-031-consumer-notification-contact-channel-and-delivery-policy.md).

## Rules

1. Domain events supply **variables only** — never HTML/body fragments.
2. Templates are rendered by the email adapter layer from stored definitions.
3. Integer `templateVersion` increments on breaking variable contract changes.
4. Unknown template ID → projection/delivery rejected.

## Catalogue

### `contact_verify_v1` (version 1)

| | |
| --- | --- |
| Channel | EMAIL |
| Purpose | Verify consumer-added notification email |
| Mandatory | Yes (security/onboarding) |

**Required variables:** `action_url`, `product_name`

**Optional:** none

**Forbidden:** payment amounts, provider details, internal UUIDs

---

### `payment_action_required_v1` (version 1)

| | |
| --- | --- |
| Channel | EMAIL |
| Trigger | Workflow → `ACTION_REQUIRED` |
| Mandatory transactional | Yes |

**Required variables:** `product_name`, `merchant_public_id`, `connection_public_id`, `bill_public_id`, `payment_workflow_public_id`, `amount_display`, `currency`, `due_date`, `action_url`

**Forbidden:** decline codes, provider messages, PAN, bank details, session tokens in URL

**Copy intent (semantic):** Consumer action needed to continue payment attempt; link to authenticated portal connection view.

---

### `payment_failed_v1` (version 1)

| | |
| --- | --- |
| Channel | EMAIL |
| Trigger | Terminal `PaymentFailed` |
| Mandatory transactional | Yes |

**Required variables:** same as `payment_action_required_v1`

**Forbidden:** raw decline response, attempt ordinals spam, internal failure diagnostics

**Copy intent (semantic):** Payment could not be completed within recovery window; merchant may resume collection per their billing process.

---

### `payment_collected_v1` (version 1)

| | |
| --- | --- |
| Channel | EMAIL |
| Trigger | `PaymentCollected` |
| Mandatory transactional | Yes |

**Required variables:** `product_name`, `merchant_public_id`, `connection_public_id`, `bill_public_id`, `payment_workflow_public_id`, `amount_display`, `currency`

**Optional:** `due_date`

**Forbidden:** ledger/settlement internals, provider capture refs

**Copy intent (semantic):** Payment successfully collected confirmation.

## Merchant naming

No canonical merchant display name in MVP schema. Templates use `product_name` and `merchant_public_id` phrasing only.

## Action URLs

Public portal routes with session authentication at click time. Example pattern:

```text
/portal/consumer/connections/{connectionPublicId}
```

No embedded credentials.
