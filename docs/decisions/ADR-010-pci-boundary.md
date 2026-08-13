# ADR-010 — Raw Card Data Remains Outside Sparelane

## Status

Accepted

## Context

ADR-001 records the product decision to use PSP tokenisation rather than storing raw cards. Reviewers still need an explicit **trust and PCI scope boundary**: where cardholder data may exist, and what Sparelane systems are prohibited from handling.

## Decision

Raw cardholder data entry and tokenisation remain within the PCI-compliant payment provider boundary.

Sparelane may store only:

- PSP token / payment method references
- permitted non-sensitive metadata (for example masked PAN/last four, brand, expiry where allowed)
- provider and attempt references

Sparelane must not store raw PAN/CVV and must never intentionally receive or persist CVV.

## Consequences

### Positive

- clearer security review boundary
- reduced Sparelane PCI scope relative to storing CHD
- aligns Consumer/Add Card flows with external tokenisation UX
- limits blast radius of Sparelane application compromise

### Negative / tradeoffs

- PSP dependency for card capture availability
- final PCI SAQ/level still depends on integration method (TBD; not claimed here)
- token portability constraints remain

## Relationship to ADR-001

- **ADR-001** — choose PSP tokenisation over raw card vaulting
- **ADR-010** — fix the trust/scope boundary and prohibitions for Sparelane systems
