# Scalability

Scaling dimensions (no invented TPS numbers):

- merchant count
- consumers
- bill events
- payment attempts
- retries
- webhook deliveries
- ledger entries
- settlements

## Principles

- stateless API / experience horizontal scaling
- worker concurrency limits (especially financial workers)
- per-workflow / per-settlement serialization where needed
- database connection pooling/control
- queue-based load smoothing
- analytics isolated from transactional path
- shed Tier-3 work before degrading Tier-1 correctness
