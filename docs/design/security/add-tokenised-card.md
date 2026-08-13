---
id: SEQ-SEC-001
title: Add Tokenised Card
type: sequence
area: security
status: accepted
mvp: true
likec4: []
requirements:
  - FUN-CON-003
  - NFR-SEC-002
adrs:
  - ADR-001
  - ADR-010
tests: []
---

# Add Tokenised Card

## Purpose

Consumer adds a card via PSP secure capture. PAN/CVV never enter Sparelane application storage; Sparelane stores only the token reference and permitted metadata.

## Preconditions

- Consumer authenticated in Consumer Web.
- PSP tokenisation / hosted fields available.

## Mermaid

```mermaid
sequenceDiagram
    autonumber
    participant C as Consumer
    participant Web as Consumer Web
    participant PSP as PSP Tokenisation
    participant BFF as Consumer BFF
    participant PMS as Payment Method Service
    participant ODB as Operational DB
    participant Pri as Method Priority Service

    C->>Web: Add payment method
    Web->>PSP: Open PSP secure card entry
    Note over Web,PSP: PCI boundary — PAN/CVV never to Sparelane
    PSP-->>BFF: Token reference only
    BFF->>PMS: Save token reference + metadata
    PMS->>ODB: Store token and metadata only
    PMS->>Pri: Set method priority
```

## Important invariants

- Raw CHD (PAN/CVV) never traverses Sparelane app storage (ADR-001, ADR-010).
- Sparelane holds token reference + display metadata only.
- PCI scope remains with the tokenisation provider for card capture.

## Failure notes

- Tokenisation failure → no Sparelane payment method row.
- Never log or persist PAN/CVV in Sparelane logs/DB.

## Related

LikeC4 dynamic view `addPaymentMethod` (architecture). FUN-CON-003.
