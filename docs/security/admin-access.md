# Admin Access Controls

Controls for privileged Sparelane administrative operations.

## Required conceptual controls

- MFA required for administrator authentication
- short-lived admin sessions (exact TTL TBD)
- explicit privileged role assignment (no implicit admin)
- no shared admin accounts
- durable audit trail for privileged actions
- elevated actions visible in audit with actor, action, target, result and correlation IDs
- support access scoped to legitimate need (tenant/case scoping TBD)
- financial mutations tightly controlled
- production secret access restricted (via secrets management; no casual UI exposure)
- **no direct ledger mutation through admin UI** — ledger remains append-only via constrained financial write paths; compensating entries follow financial integrity rules

## Break-glass access

Emergency elevated access may be required for incident response.

Implementation, approval workflow and dual-control requirements are **TBD**.

## Examples of privileged actions

- merchant approval / suspension
- credential revocation assistance
- webhook replay for authorised operators
- payment investigation tooling
- settlement investigation (not arbitrary settlement amount edits)
- role/permission changes
- production configuration changes affecting financial flows
