# Runbook — Ledger Posting Failure

## Symptom

Workflows in `COLLECTED` without confirmed ledger journal; ledger posting lag/failure alerts; outbox backlog.

## Impact

Settlement must not proceed until ledger posting confirmed. Financial reporting incomplete until recovered.

## Checks

- outbox unpublished / failed publish counts
- ledger consumer errors / DLQ
- workflows COLLECTED lacking posting confirmation marker
- whether duplicate journal risk exists for replay

## Safe actions

- retry idempotent ledger consumer
- repair via controlled replay after state check
- pause settlement eligibility advancement if confirmation broken

## Unsafe actions

- manually editing ledger balances outside append-only journal rules
- settling merchants without confirmed journal
- inserting duplicate journals for the same collection reference

## Escalation

Tier-1 on-call → ledger/finance engineering.

## Recovery validation

- exactly one journal per successful collection
- posting confirmed
- settlement eligibility unblocked only after confirmation
