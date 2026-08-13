# PCI Boundary

## Inside external PCI provider boundary

- raw PAN
- CVV
- secure card-entry fields / hosted fields / equivalent PSP capture UX
- tokenisation

## Inside Sparelane

Permitted conceptually:

- PSP token / payment method reference
- masked PAN / last four where the provider permits
- card brand
- expiry metadata where permitted
- provider references
- payment attempt metadata (amounts, statuses, classifications — never PAN/CVV)

## Explicit prohibitions

- Sparelane application systems must **not** store raw PAN/CVV
- Sparelane must **never intentionally receive or persist CVV**
- Admin tooling must not display or export raw card data (Sparelane should not possess it)

## Scope note

Final PCI DSS scope and any SAQ classification depend on the selected PSP integration method (hosted fields, redirect, etc.) and provider architecture.

**Do not claim a PCI SAQ level in this repository yet.**

Related decisions:

- [ADR-001](../decisions/ADR-001-psp-tokenisation.md) — tokenisation choice
- [ADR-010](../decisions/ADR-010-pci-boundary.md) — explicit trust/scope boundary
