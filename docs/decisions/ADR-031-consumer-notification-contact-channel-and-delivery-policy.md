---
id: ADR-031
title: Consumer Notification Contact, Channel and Delivery Policy
status: Accepted
date: 2026-08-22
deciders: Architecture
consulted: Product / Security / Privacy / Operations
informed: Platform engineering
supersedes: []
related:
  - ADR-009
  - ADR-017
  - ADR-019
  - ADR-020
  - ADR-023
  - ADR-024
  - ADR-030
  - OD-005
  - OD-014
  - OD-025
  - OD-035
---

# ADR-031 — Consumer Notification Contact, Channel and Delivery Policy

## Status

**Accepted**

Unblocks platform **G2** (consumer notification domain, contact ownership, email delivery foundation) without inventing SMS, marketing consent, bill-due reminder cadence, or a real email vendor.

Resolves the **core** product/privacy/domain questions previously tracked in [OD-005](./open/OD-005-notification-rules.md). Remaining open items are explicitly deferred (§22).

## Context

[ADR-030](./ADR-030-merchant-webhook-contract-signing-and-delivery.md) delivered merchant webhooks (G0/G1) and deferred consumer notifications because architecture lacked:

1. consumer contact ownership separate from authentication identity
2. closed consumer notification use-case catalogue
3. MVP channel policy (email vs SMS)
4. template / variable contract
5. notification intent idempotency and delivery semantics

Platform G1 is complete. Consumer notifications must not:

- silently reuse `users.email` / IdP email as a delivery destination
- mirror merchant webhooks one-for-one without consumer value
- mutate financial state on delivery success/failure ([ADR-019](./ADR-019-financial-workload-isolation.md))
- send arbitrary HTML from domain events

This ADR freezes the **G2 MVP** consumer notification policy. Canonical Phase G (G0+G1+G2) is complete on local Fake email evidence once platform G2 passes; SMS, preferences, and bill reminders remain G3+ deferred slices.

---

## Decision summary (binding)

| # | Decision |
| --- | --- |
| 1 | **Dedicated contact model:** `ConsumerNotificationContact` owned by Notifications module; **not** fields on `consumers`; **not** auth/IdP email by default |
| 2 | **Identity-email boundary:** `users.email` / ExternalIdentity email is **authentication only** until explicitly promoted via contact onboarding + verification |
| 3 | **MVP channel:** **email only**. SMS deferred to G3+ |
| 4 | **Verification:** email contact must reach `ACTIVE` via explicit verification before payment notifications send |
| 5 | **Default destination:** explicit `is_default`; at most one `ACTIVE` default email per consumer; never infer from creation order alone |
| 6 | **Closed G2 notification catalogue (3 types):** `payment.action_required`, `payment.failed`, `payment.collected` |
| 7 | **Mandatory transactional:** all three G2 types are mandatory; **no preferences model in G2** |
| 8 | **Bill due reminders:** **deferred** — timing/cadence not binding |
| 9 | **Intent vs delivery:** `ConsumerNotification` (logical) + `ConsumerNotificationDeliveryAttempt` (transport) |
| 10 | **Idempotency:** one logical notification per `(notification_type, payment_workflow_public_id)` |
| 11 | **Templates:** closed template IDs + integer version; variables whitelist only; no arbitrary HTML/body from events |
| 12 | **No valid destination:** record `SKIPPED` intent; no provider call; no financial mutation; no automatic retry when contact later appears |
| 13 | **Provider port:** neutral `EmailProvider.sendEmail({ idempotencyKey, to, templateId, templateVersion, variables })` |
| 14 | **Provider outcomes:** `accepted` \| `rejected` \| `technical_error` \| `unknown`; `accepted` = provider accepted for sending, **not** inbox delivery |
| 15 | **Retry:** 5 attempts max; delays 2m / 10m / 1h / 6h; retry `technical_error` and `unknown`; exhaustion → `FAILED` |
| 16 | **Fake email provider:** `nonProductionOnly`; records messages; stable provider ref; production/sandbox fail closed without approved provider |
| 17 | **Worker:** `notification-worker` owns consumer notification projection/delivery alongside merchant webhooks; separate handlers |
| 18 | **Recipient resolution:** authoritative DB graph only — `PaymentWorkflow → Bill → MerchantConnection → Consumer` |
| 19 | **Anonymisation:** deleted/anonymised consumer blocks future sends; contacts revoked/tombstoned |
| 20 | **Financial boundary:** notification delivery must not mutate Bill, PaymentWorkflow, PaymentAttempt, Ledger, Settlement |

---

## 1. Contact ownership (Option A)

**Chosen:** dedicated **`ConsumerNotificationContact`** entity.

**Rejected:**

| Option | Reason |
| --- | --- |
| B — fields on `consumers` | Couples profile lifecycle to communication destinations; blocks multi-contact and channel expansion |
| C — reuse auth/IdP email | Violates B0/B2 identity boundary; conflates authentication with product communication consent |

Notifications module owns contacts. Consumers module owns business profile. Identity module owns authentication subjects.

---

## 2. Identity-email boundary (binding)

```text
users.email / ExternalIdentity.email ≠ notification destination
```

Promotion path:

```text
authenticated consumer
→ AddConsumerNotificationContact (portal/BFF)
→ verification challenge to supplied address
→ VerifyConsumerNotificationContact
→ ACTIVE (+ optional default)
```

Platform must **never** infer notification email from login identity, bill payload, merchant connection metadata, or IdP claims.

---

## 3. Contact model

| Field | Rule |
| --- | --- |
| `public_id` | `cnc_…` opaque ([ADR-020](./ADR-020-opaque-public-identifiers.md)) |
| `consumer_id` | FK; tenant = consumer |
| `channel` | MVP: `EMAIL` only |
| `email_address` | Required when `channel=EMAIL`; normalised lowercase trimmed |
| `status` | `PENDING` \| `ACTIVE` \| `INACTIVE` \| `REVOKED` |
| `verified_at` | Set on transition to `ACTIVE` |
| `is_default` | Boolean; at most one `ACTIVE` default per `(consumer_id, channel)` |
| timestamps | `created_at`, `updated_at` |

**Uniqueness:** `(consumer_id, channel, email_address_normalised)` unique among non-`REVOKED` rows (no global email uniqueness).

**Value change:** revoke existing contact; create new row. No in-place email mutation.

**Classification:** Confidential (personal data). Restricted in logs/audit (masked only).

---

## 4. Contact lifecycle

| From | To | Trigger |
| --- | --- | --- |
| — | `PENDING` | contact added |
| `PENDING` | `ACTIVE` | verification succeeded |
| `PENDING` | `REVOKED` | user revoke / deletion |
| `ACTIVE` | `INACTIVE` | user disable |
| `INACTIVE` | `ACTIVE` | user re-enable (must still be verified) |
| `ACTIVE` / `INACTIVE` | `REVOKED` | user revoke / consumer deletion |

`REVOKED` is terminal. No send to non-`ACTIVE` contacts.

Contact verification email uses template `contact_verify_v1` (security/onboarding; not a payment notification intent).

---

## 5. MVP channels

**Email only** for G2.

SMS (`INT-NOT-002`) remains `mvp: false` until G3+. Do not add phone fields solely for future SMS in G2 schema beyond optional reserved enum value.

---

## 6. Closed G2 notification catalogue

Consumer notifications are **not** a mirror of merchant webhooks. Only consumer-valuable payment lifecycle messages are in G2.

| `notification_type` | Trigger (internal event) | When | Mandatory |
| --- | --- | --- | --- |
| `payment.action_required` | workflow → `ACTION_REQUIRED` | First transition into `ACTION_REQUIRED` for workflow | Yes |
| `payment.failed` | `PaymentFailed` | Terminal workflow `FAILED` | Yes |
| `payment.collected` | `PaymentCollected` | Successful collection | Yes |

**Explicitly not in G2:**

| Item | Reason |
| --- | --- |
| `bill.accepted` | No binding consumer-facing value |
| settlement.* | Consumer-facing settlement notices undefined |
| bill due reminders | Reminder timing/cadence not binding ([§7](#7-bill-due-reminders-deferred)) |
| per-attempt decline spam | ACTION_REQUIRED and FAILED cover remediation/terminal paths |

**ACTION_REQUIRED rule:** notify on **state entry**, not on every retryable decline or attempt. Re-entry to `ACTION_REQUIRED` after leaving does **not** create a second logical notification (same idempotency key).

**FAILED rule:** only terminal `PaymentFailed`, not intermediate declines.

---

## 7. Bill due reminders (deferred)

Architecture does not bind:

- reminder offset(s) from due date
- number of reminders
- timezone presentation rules for reminder copy
- optional vs mandatory status

**G2 must not implement bill due reminders.** Track under G3+ / future OD extension.

---

## 8. Notification intent vs delivery

```text
internal domain event (closed mapping)
→ ProjectConsumerNotification (idempotent)
→ ConsumerNotification row
→ DeliverConsumerNotification (provider call outside DB TX)
→ ConsumerNotificationDeliveryAttempt rows
→ SENT | schedule retry | FAILED | SKIPPED
```

`ConsumerNotification` stores: type, template id/version, consumer ref, workflow ref, destination contact ref (nullable if skipped), status, `business_reference`.

Attempts store: attempt number, provider outcome, provider message ref, error class (bounded).

---

## 9. Notification identity / idempotency

```text
business_reference = notify:{notification_type}:{payment_workflow_public_id}
```

Unique constraint on `business_reference`.

Same source workflow + type → one logical notification forever.

Scheduled reminders (future) may append ordinal/window suffix when introduced.

Provider idempotency key = `business_reference` (stable across crash/replay).

At-least-once async processing ([ADR-017](./ADR-017-at-least-once-async-processing.md)) may redeliver work items; provider idempotency + unique intent prevent duplicate logical sends when supported. Do **not** claim exactly-once email delivery to inbox.

---

## 10. Template catalogue (G2)

Architecture freezes **template contract**, not final marketing copy. Platform supplies placeholder copy in local/dev; legal/compliance review remains product follow-up.

| template_id | version | channel | use case |
| --- | --- | --- | --- |
| `contact_verify_v1` | 1 | EMAIL | contact verification (onboarding) |
| `payment_action_required_v1` | 1 | EMAIL | ACTION_REQUIRED |
| `payment_failed_v1` | 1 | EMAIL | terminal FAILED |
| `payment_collected_v1` | 1 | EMAIL | successful collection |

### Allowed variables (whitelist)

| Variable | Source |
| --- | --- |
| `consumer_public_id` | consumer |
| `merchant_public_id` | merchant |
| `connection_public_id` | merchant connection |
| `bill_public_id` | bill |
| `payment_workflow_public_id` | workflow |
| `amount_display` | bill/workflow money (formatted) |
| `currency` | ISO code |
| `due_date` | bill due date (date-only) |
| `action_url` | portal deep link (public route; session auth) |
| `product_name` | constant `"Sparelane"` |

### Forbidden variables

- raw/internal UUIDs
- auth subject / session token / magic login link with embedded credential
- provider token / decline payload / AVS/CVC details
- bank account / PAN / CVV
- merchant webhook secret
- consumer email in outbound merchant payloads (N/A here)

### Merchant naming

`merchants` MVP schema has no canonical display/legal name field. Templates use `product_name` + `merchant_public_id` reference phrasing ("your connected merchant") — **do not invent** display names.

### Action URL

Authenticated consumer portal route using public IDs only, e.g.:

```text
/portal/consumer/connections/{connectionPublicId}
```

No bearer tokens in URL. Consumer must already have (or establish) session at click time.

---

## 11. Preferences (deferred in G2)

All G2 payment notifications are **mandatory transactional** communications about payment state the consumer is party to.

**No `NotificationPreference` persistence in G2.**

G3+ may add preferences for optional/reminder classes. Do not create marketing opt-in/out semantics in G2.

---

## 12. No valid destination

When no `ACTIVE` verified default email exists at projection time:

1. Persist `ConsumerNotification` with status **`SKIPPED`**
2. Reason code `NO_ACTIVE_CONTACT`
3. **No** provider call
4. **No** retry when contact later added (no retroactive backfill in G2)
5. Financial state unchanged

Future requeue policy requires explicit ADR amendment.

---

## 13. EmailProvider port (neutral)

```typescript
interface EmailProvider {
  sendEmail(input: {
    idempotencyKey: string;
    to: string; // normalised email
    templateId: string;
    templateVersion: number;
    variables: Record<string, string>;
    correlationId?: string;
  }): Promise<EmailSendResult>;
}

type EmailSendOutcome = 'accepted' | 'rejected' | 'technical_error' | 'unknown';

interface EmailSendResult {
  outcome: EmailSendOutcome;
  providerMessageRef?: string; // opaque provider id when accepted
}
```

No vendor-specific fields in domain modules.

---

## 14. Delivery semantics

| Notification status | Meaning |
| --- | --- |
| `PENDING` | Intent created; delivery not yet accepted by provider |
| `SENT` | Provider returned `accepted` (handed off for sending) |
| `FAILED` | Exhausted retries or permanent `rejected` |
| `SKIPPED` | No destination / policy skip |

There is **no** `DELIVERED` / read-receipt status in G2. Inbox delivery is unknowable at MVP.

---

## 15. Retry policy (consumer email)

Independent from merchant webhook retry ([ADR-030](./ADR-030-merchant-webhook-contract-signing-and-delivery.md)).

| Parameter | Value |
| --- | --- |
| Max attempts | **5** (initial + 4 retries) |
| Delays after failure | **2m, 10m, 1h, 6h** |
| Retry on | `technical_error`, `unknown` |
| No retry on | `rejected` |
| Exhaustion | notification → `FAILED`; **no** financial mutation |

Use durable scheduler / job queue same as webhooks; separate job type namespace (`notification.deliver`).

---

## 16. Fake vs production provider

| Environment | Rule |
| --- | --- |
| local / test | `FakeEmailProvider` allowed; `nonProductionOnly`; records sent messages for assertions |
| sandbox / production | **Fail closed** without configured approved `EmailProvider`; **never** auto-select Fake |

Email vendor selection: [OD-035](./open/OD-035-email-provider.md) (open). Provider credentials: Restricted ([secrets-management](../security/secrets-management.md), OD-025).

---

## 17. Worker ownership

**notification-worker** ([workers.md](../implementation/workers.md)):

| Route | Handler |
| --- | --- |
| `webhook.*` | existing G0/G1 merchant webhook projection/delivery |
| `notification.*` | G2 consumer notification projection/delivery |

Must not mutate financial modules. Must not import payment orchestration for side effects.

---

## 18. Event projection mapping (closed)

| Internal event | Project when | notification_type |
| --- | --- | --- |
| workflow entered `ACTION_REQUIRED` | first time for workflow | `payment.action_required` |
| `PaymentFailed` | emitted once per terminal failure | `payment.failed` |
| `PaymentCollected` | emitted once per collection | `payment.collected` |

No other internal events may project consumer notifications in G2.

Recipient resolution path (mandatory):

```text
PaymentWorkflow
  → Bill (bill_id)
    → MerchantConnection (merchant_id + consumer_id)
      → Consumer
        → ConsumerNotificationContact (ACTIVE default EMAIL)
```

Never trust `consumerId` from event payload alone.

---

## 19. Privacy, audit, observability

**Logs / metrics / spans:** may include `notification_type`, outcome, attempt number, bounded `error_class`, correlation id. **Forbidden:** email address, full template variables containing PII, provider API keys.

**Audit (contact lifecycle):** contact added, verified, default changed, disabled, revoked. Routine automated send = delivery rows, not audit event.

**Security signals:** cross-consumer contact mutation; invalid destination tampering. Ordinary provider `5xx` ≠ security incident.

**Retention:** follow [retention.md](../data/retention.md) categories; exact periods OD-014 TBD. Delivery records retained as operational evidence; PII minimised on anonymisation.

---

## 20. Anonymisation / deletion

On consumer deletion/anonymisation ([consumer-deletion.md](../data/consumer-deletion.md)):

1. Revoke all contacts (`REVOKED`)
2. Block future projection/delivery
3. Historical `ConsumerNotification` / attempts may retain minimised operational metadata with contact value removed or pseudonymised per privacy policy

Financial records remain intact.

---

## 21. Commands and events (canonical names)

| Command | Purpose |
| --- | --- |
| `AddConsumerNotificationContact` | Portal: add email → `PENDING` |
| `VerifyConsumerNotificationContact` | Complete verification → `ACTIVE` |
| `SetDefaultConsumerNotificationContact` | Explicit default selection |
| `DisableConsumerNotificationContact` | `ACTIVE` → `INACTIVE` |
| `RevokeConsumerNotificationContact` | Terminal revoke |
| `ProjectConsumerNotification` | Idempotent intent from closed mapping |
| `DeliverConsumerNotification` | Provider send outside TX |

| Event | Meaning |
| --- | --- |
| `ConsumerNotificationContactAdded` | Contact row created |
| `ConsumerNotificationContactVerified` | Contact ACTIVE |
| `ConsumerNotificationProjected` | Intent persisted |
| `ConsumerNotificationDelivered` | Provider accepted |
| `ConsumerNotificationDeliveryFailed` | Exhausted / rejected |
| `ConsumerNotificationSkipped` | No destination |

Legacy name `NotifyConsumer` maps to projection + delivery orchestration — prefer explicit commands above in new work.

---

## 22. Deferred (explicitly not decided here)

| Item | Tracking |
| --- | --- |
| SMS channel + phone model | G3+; INT-NOT-002 |
| Notification preferences / marketing | G3+ |
| Bill due reminder cadence | Future OD / G3+ |
| Final marketing/legal email copy | Product/compliance |
| Email vendor | [OD-035](./open/OD-035-email-provider.md) |
| Operator notification replay UI | **Deferred past H2** — [ADR-034](./ADR-034-durable-dead-letter-and-operator-replay-policy.md) Option A excludes notification replay. `NO_ACTIVE_CONTACT` / `SKIPPED` must never be manually replayed merely because a contact later exists. Future gate required before any `admin.notification.replay`. |
| Locale/i18n | Future |

---

## Consequences

### Positive

- Platform G2 can implement without guessing contact ownership
- Identity boundary preserved
- Payment notifications bounded and idempotent
- Financial isolation preserved

### Negative / tradeoffs

- Consumers without verified email receive no payment emails (SKIPPED)
- No SMS in G2
- No bill reminders until cadence decided
- Production email blocked until OD-035 + provider configured

## Alternatives considered

1. **Auth email as default destination** — rejected; breaks identity/communication separation.
2. **Contact fields on Consumer** — rejected; poor lifecycle/channel extensibility.
3. **Mirror all merchant webhook types to consumers** — rejected; wrong audience and PII risk.
4. **Bill due reminder in G2 with guessed cadence** — rejected; timing not binding.
5. **Reuse webhook retry schedule** — rejected; different provider semantics and duration.
6. **Preferences table with empty defaults in G2** — rejected; all G2 types mandatory transactional.

## Related architecture

- Gate: [phase-g2-consumer-notification-decision-gate.md](../implementation/phase-g2-consumer-notification-decision-gate.md)
- Contact: [consumer-notification-contact.md](../notifications/consumer-notification-contact.md)
- Delivery: [consumer-notification-delivery.md](../notifications/consumer-notification-delivery.md)
- Templates: [notification-templates.md](../contracts/notification-templates.md)
- Schema: [relational-model.md](../schema/relational-model.md)
- Resolves core: [OD-005](./open/OD-005-notification-rules.md)
- Complements: ADR-030 (merchant webhooks), ADR-019 (isolation), ADR-024/025 (payment states)
