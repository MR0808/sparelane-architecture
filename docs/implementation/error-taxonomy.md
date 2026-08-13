# Error Taxonomy

| Category | Examples | Retryable? |
| --- | --- | --- |
| validation | Bad request body | No |
| auth | Invalid API key | No |
| permission | Wrong tenant/scope | No |
| domain conflict | Illegal state transition; idempotency conflict | No (client must correct) |
| transient dependency | PSP 503, DB deadlock | Yes (bounded) |
| permanent dependency | Hard decline; invalid merchant config | No |
| unknown external outcome | PSP timeout after submit | Special — reconcile, do not blind duplicate |
| invariant violation | Unbalanced journal attempt | No — fail closed + alert |
| infrastructure failure | Queue down | Yes / degrade safely |

Map to Merchant API error codes where applicable (`validation_error`, `idempotency_conflict`, `temporarily_unavailable`, …). Do not throw opaque generic errors from domain boundaries.
