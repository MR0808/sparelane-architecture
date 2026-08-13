# Disaster Recovery

Final RPO/RTO numeric targets are **TBD**. Classify sensitivity only.

## Sensitivity

| Data class | Conceptual loss tolerance |
| --- | --- |
| Financial ledger | Near-zero tolerated data loss |
| Operational workflow | Must be recoverable; brief lag acceptable if eventually consistent with ledger |
| Audit | Long-lived; loss impairs investigation |
| Analytics | Greater lag/loss acceptable if rebuildable from sources |

## Capabilities (required conceptually)

- backups of authoritative stores
- point-in-time recovery where the managed database supports it
- restore testing
- high-availability / multi-AZ deployment where applicable
- DR exercises

Regions, multi-region active-active, and exact RPO/RTO values remain **TBD**.
