# ADR-001 — PSP Tokenisation Instead of Raw Card Storage

## Status

Accepted

## Context

Sparelane needs to collect recurring card payments reliably. Handling raw card data (PAN/CVV) inside Sparelane application systems would expand PCI scope, increase security exposure, and require specialised card-data infrastructure.

Sparelane's differentiator is payment reliability orchestration, not card vaulting.

## Decision

Sparelane delegates raw card capture and tokenisation to a PCI-compliant Payment Service Provider (PSP) and stores only:

- provider token references
- permitted non-sensitive payment method metadata

Raw PAN and CVV must not enter Sparelane application storage.

## Consequences

### Positive

- materially reduces PCI scope for Sparelane application systems
- reduces blast radius if Sparelane operational data is compromised
- allows Sparelane to focus engineering effort on reliability workflows
- aligns with AP-03 and AP-04

### Negative / tradeoffs

- dependency on PSP tokenisation availability and quality
- token portability between providers may be limited or costly
- PSP outages or API changes affect method capture and payment execution
- some metadata richness depends on provider capabilities

## Alternatives Considered

1. **Store raw card data in Sparelane** — rejected due to PCI and security cost.
2. **Use a separate card vault vendor distinct from the processing PSP** — possible later, but still keeps raw card data outside Sparelane app storage; not required for MVP architecture.
3. **Network tokens only / scheme tokenisation first** — compatible direction later; does not change the decision to keep PAN/CVV out of Sparelane.
