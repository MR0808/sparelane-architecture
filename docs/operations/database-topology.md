# Database Topology

Candidate production topology. **Not a final vendor or sizing decision.**

## Operational DB

Managed relational database (PostgreSQL-compatible assumed by current architecture). Authoritative for workflows, bills, attempts, integration/webhook metadata, etc.

## Ledger DB

May be:

1. **Same physical cluster** with separate database/schema
2. **Separate managed database/cluster**

Choice depends on:

- transactional consistency needs
- security / blast radius
- scaling
- operational complexity

Connects to [ADR-016](../decisions/ADR-016-operational-ledger-consistency.md): default logical consistency is **transactional outbox + idempotent ledger posting**, which works with either same-cluster or separate-cluster topologies and avoids requiring a distributed transaction.

## Audit Store / Analytics Store

May share infrastructure or be separate. Analytics must remain isolated from Tier-1 financial paths. Exact layout **TBD**.
