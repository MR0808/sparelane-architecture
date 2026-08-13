# ADR-012 — Privileged Admin Actions Are Auditable

## Status

Accepted

## Context

Administrators can investigate payments, manage merchants, assist with credentials/webhooks and operate privileged tooling. Without durable audit, misuse and incident investigation are impaired. Logging must not itself become a secret or CHD leak channel.

## Decision

Privileged administrative and financially sensitive actions must produce durable audit events.

Conceptual audit fields: actor, action, target, timestamp, context, result, correlation/reference IDs.

Do not log secrets, raw credentials, session tokens, PAN or CVV.

## Consequences

### Positive

- accountability for privileged operations
- support for incident response and compliance reviews
- deterrence against casual misuse

### Negative / tradeoffs

- privacy: audit stores Restricted data and need access controls
- storage/retention cost
- risk of over-logging sensitive fields if engineers are careless
- dual-control / break-glass workflows remain TBD and are not replaced by audit alone

## Alternatives Considered

1. **Application logs only** — rejected as insufficient durability/structure for privileged accountability.
2. **No admin audit until SOC 2 programme** — rejected; audit is an architecture requirement earlier.
