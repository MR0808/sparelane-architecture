# Scheduling

Time-based work is triggered by a Platform Scheduler (vendor TBD).

## Work types

- bill due actions
- pre-authorisation windows
- payment retries due
- settlement sweeps
- reconciliation jobs
- periodic maintenance

## Rule

> Scheduler creates commands / work items. It does **not** own workflow state or execute complex financial logic itself.

Authoritative state remains in Operational DB / Ledger DB and domain services (Payment Orchestrator, Settlement Service, etc.).

Bill Scheduler in the logical model is an example of this pattern for bill-driven actions.
