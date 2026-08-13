# Architecture Change Checklist

Use on architecture PRs. Not every item applies to every change.

## Model & flows

- [ ] LikeC4 model/views updated
- [ ] Dynamic flows updated if behaviour changed
- [ ] View titles remain in `01`–`10` hierarchy
- [ ] No accidental microservice-per-logical-service implication (ADR-018)

## Decisions

- [ ] ADR required? If yes: added/updated via [ADR-TEMPLATE](../decisions/ADR-TEMPLATE.md)
- [ ] Accepted ADRs not contradicted (or superseded explicitly)
- [ ] [Open decisions](../decisions/open-decisions.md) updated if relevant
- [ ] [Decision register](../decisions/decision-register.md) updated if ADR status changes

## Contracts & data

- [ ] OpenAPI impacted? Updated + `npm run openapi:lint`
- [ ] Webhook/event contracts impacted?
- [ ] Data model / schema / ERD impacted?
- [ ] Money/time/due-date semantics impacted?

## Security & money

- [ ] Privacy/security/trust boundary impacted?
- [ ] PCI / secrets / audit docs impacted?
- [ ] Ledger/settlement impacted?
- [ ] Financial invariants / tests docs impacted?

## Operations & docs

- [ ] Runbooks impacted?
- [ ] Implementation blueprint / traceability impacted?
- [ ] Cross-links / indexes / START-HERE updated?
- [ ] `npm run docs:links` passes

## Validation

- [ ] `npm run validate`
- [ ] `npm run build` (or `npm run check`)
