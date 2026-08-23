---
id: OD-005
title: Consumer notification rules and copy
category: product
blockingStage: non-blocking
status: resolved
related:
  - docs/decisions/ADR-031-consumer-notification-contact-channel-and-delivery-policy.md
  - docs/decisions/open/OD-035-email-provider.md
---

# OD-005 — Consumer notification rules and copy

## Decision required

Consumer notification contact ownership, MVP channels, use-case catalogue, template contract, and delivery semantics for platform G2.

## Why it matters

Notification worker behaviour, privacy boundaries, and payment lifecycle consumer communications.

## Blocking stage

`non-blocking` for G0/G1 merchant webhooks; **resolved for local G2** by ADR-031.

## Status

**resolved** — core policy Accepted in [ADR-031](../ADR-031-consumer-notification-contact-channel-and-delivery-policy.md) (2026-08-22).

## Resolution summary

| Topic | Binding decision |
| --- | --- |
| Contact ownership | Dedicated `ConsumerNotificationContact`; not auth email |
| Identity email | Not a notification destination unless promoted + verified |
| MVP channel | Email only |
| G2 catalogue | `payment.action_required`, `payment.failed`, `payment.collected` |
| Preferences | Deferred (all G2 types mandatory transactional) |
| Templates | Closed IDs + variable whitelist (ADR-031 §10) |
| Idempotency | `notify:{type}:{payment_workflow_public_id}` |
| No destination | `SKIPPED`; no retroactive send |
| Delivery retry | 5 attempts; 2m/10m/1h/6h |

## Remaining open (not blocking local G2)

| Item | Tracking |
| --- | --- |
| SMS / phone contacts | G3+ |
| Bill due reminder cadence | G3+ / future OD |
| Marketing / optional preferences | G3+ |
| Final marketing/legal copy | Product/compliance |
| Email vendor | [OD-035](./OD-035-email-provider.md) |
| Exact retention periods | [OD-014](./OD-014-legal-retention.md) |

## Notes

Unresolved items no longer block platform G2 implementation with Fake email provider. Production/pilot consumer email delivery remains blocked until [OD-035](./OD-035-email-provider.md) and approved provider configuration.

See [phase-g2-consumer-notification-decision-gate.md](../../implementation/phase-g2-consumer-notification-decision-gate.md).
