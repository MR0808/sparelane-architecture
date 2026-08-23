# Consumer notification contact

Architecture for consumer communication destinations. Authority: [ADR-031](../decisions/ADR-031-consumer-notification-contact-channel-and-delivery-policy.md).

## Ownership

| Concern | Owner |
| --- | --- |
| Authentication email / IdP subject | Identity (`users`) |
| Consumer business profile | Consumers (`consumers`) |
| Notification destinations | Notifications (`consumer_notification_contacts`) |

## Identity boundary

```text
ExternalIdentity.email  ──✕──►  notification destination
```

Promotion requires explicit contact add + verification (SEQ-NOT-004).

## Lifecycle

```text
PENDING ──verify──► ACTIVE ◄──enable── INACTIVE
   │                  │
   └──revoke──────────┴──revoke──► REVOKED (terminal)
```

## Default selection

- Explicit `is_default` flag
- At most one `ACTIVE` default per `(consumer_id, channel)`
- First verified contact may auto-default if none exists
- Never infer default from `created_at` ordering alone

## Management surface

Portal/BFF only for G2 (consumer authenticated):

- add contact
- verify
- set default
- disable / revoke

## Anonymisation

Consumer deletion/anonymisation → revoke all contacts; block future delivery.

See [consumer-deletion.md](../data/consumer-deletion.md).
