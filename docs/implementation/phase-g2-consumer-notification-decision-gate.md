# Phase G2 — Consumer notification decision gate (architecture)

**Status:** PASS — binding policy in [ADR-031](../decisions/ADR-031-consumer-notification-contact-channel-and-delivery-policy.md)

Platform G1 (merchant webhook endpoint management + durable local delivery) is complete. G2 was blocked because consumer notification contact ownership, channels, catalogue, templates, and delivery semantics were open ([OD-005](../decisions/open/OD-005-notification-rules.md)).

## Hard gate result

| # | Requirement | Result |
| --- | --- | --- |
| 1 | Consumer contact data model | **Bound** — `ConsumerNotificationContact` |
| 2 | Ownership | **Bound** — Notifications module |
| 3 | Auth email usage | **Forbidden** unless promoted + verified |
| 4 | Contact verification | **Required** before ACTIVE |
| 5 | Email MVP | **Yes** |
| 6 | SMS MVP | **No** — G3+ |
| 7 | Notification use cases | **Closed (3)** |
| 8 | Mandatory transactional | **All G2 types** |
| 9 | Optional/preferences | **Deferred G3+** |
| 10 | Stable identity | **`notify:{type}:{workflowPublicId}`** |
| 11 | Template catalogue | **Closed IDs + versions** |
| 12 | Delivery states | **PENDING/SENT/FAILED/SKIPPED** |
| 13 | Retry policy | **5 attempts; 2m/10m/1h/6h** |
| 14 | Provider port | **EmailProvider neutral contract** |
| 15 | Contact deletion | **Revoke; block future sends** |
| 16 | No valid destination | **SKIPPED; no retroactive send** |

## Platform G2 must implement

1. `ConsumerNotificationContact` persistence + portal contact onboarding/verification
2. Closed projection mapping (3 payment types)
3. `ConsumerNotification` + `ConsumerNotificationDeliveryAttempt`
4. `ProjectConsumerNotification` / `DeliverConsumerNotification`
5. `FakeEmailProvider` (`nonProductionOnly`)
6. `notification-worker` routing for `notification.*` alongside `webhook.*`
7. Privacy redaction (no email in logs/metrics/audit payloads)
8. Tests per [CON-NOT-001](../../requirements/tests/CON-NOT-001.md)

## Must not invent

- SMS / phone model (G3+)
- Bill due reminder schedule
- Marketing preferences / opt-out table
- Auth email as silent destination
- Merchant display name not in schema
- Financial mutation on delivery outcome
- Fake email in sandbox/production
- Arbitrary event → email mapping

## Engineering decomposition (local slices)

| Slice | Scope |
| --- | --- |
| **G2** | Contact domain + email foundation + 3 mandatory payment notifications + Fake provider |
| **G3+** | SMS, preferences, bill reminders, optional communications |

Canonical Phase G is **not** complete after G2.

## Still TBD (not G2 blockers)

- [OD-035](../decisions/open/OD-035-email-provider.md) email vendor (production)
- [OD-014](../decisions/open/OD-014-legal-retention.md) exact retention periods
- Final marketing/legal copy (template placeholders allowed locally)
- Operator notification replay (Phase H)

## Exit criterion

**G2 NOTIFICATION DECISION GATE: PASS**

Platform may proceed to G2 implementation without inferring notification email from ExternalIdentity.
