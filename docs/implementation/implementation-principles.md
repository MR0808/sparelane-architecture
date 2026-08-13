# Implementation Principles

Engineering principles for building Sparelane from the approved architecture. Accepted ADRs are binding.

## Start as a modular platform, not premature microservices

[ADR-018](../decisions/ADR-018-logical-vs-physical-services.md): logical services do not imply separate deployables.

Prefer a small number of deployables with strong internal module boundaries. Extract services later when scale or team boundaries justify it.

## Financial correctness first

Payment, ledger and settlement code must prioritise:

- idempotency
- state correctness
- auditability
- recoverability

over convenience shortcuts.

## Server-side authority

Client/browser state must never be authoritative for:

- payment state
- merchant identity
- settlement state
- financial state
- role/permission state

## Explicit module boundaries

Business domains expose explicit APIs/interfaces even when deployed together. Route handlers and UI must not contain core payment/ledger logic.

## Async side effects

Long-running or failure-prone work uses durable async processing where designed (outbox, workers, webhooks, notifications, settlement).

## External providers behind adapters

Domain logic must not tightly couple to PSP, bank, email, SMS or KYC vendor SDKs. Adapters translate vendor semantics into Sparelane domain semantics.
