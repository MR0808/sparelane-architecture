# Concurrency Controls

## Payment Workflow

Avoid simultaneous attempts that could collect twice for the same workflow.

Candidate techniques (implementation TBD):

- optimistic concurrency / version checks
- row lock
- distributed lock
- serialized queue partition by workflow ID

## Settlement

Avoid duplicate provider submission:

- settlement state machine
- idempotency / provider reference
- unknown-outcome query before blind resubmit

## Webhooks

Parallel delivery allowed across **different** events. Each event maintains stable delivery state; retries reuse the same event ID.
