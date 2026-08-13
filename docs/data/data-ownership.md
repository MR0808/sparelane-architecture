# Data Ownership Matrix

Conceptual ownership for major Sparelane entities. Not a physical schema.

| Data / Entity | Authoritative Owner | Stored By | Derived By | External Reference | Classification | Mutability |
| --- | --- | --- | --- | --- | --- | --- |
| Consumer | Sparelane (Consumer Domain) | Operational DB | — | Identity subject refs | Confidential | Mutable profile; soft-delete/anonymise eligible |
| Merchant | Sparelane (Merchant Domain) for Sparelane merchant record; merchant owns billing master | Operational DB | — | Merchant org identifiers | Confidential | Mutable config; offboarding archives |
| Merchant User | Sparelane Identity + Merchant Domain | Operational DB / Identity | — | IdP subject | Confidential | Mutable; revoke on offboarding |
| Merchant Connection | Sparelane (Merchant Connection Service) | Operational DB | — | `merchantCustomerReference` | Confidential | Mutable status; retain refs as required |
| Payment Method Reference | Sparelane stores reference; **PSP authoritative for token/CHD** | Operational DB (token metadata only) | Display metadata from provider where permitted | PSP token / method ID | Confidential–Restricted | Revocable; never stores PAN/CVV |
| Bill (merchant original) | **Merchant** | Merchant systems | — | Merchant invoice/bill IDs | (external) | Merchant-controlled |
| Bill (Sparelane received) | Sparelane (Bill Management) | Operational DB | Consumer bill projection | `merchantBillReference`, reconciliation ref | Confidential | Immutable core amounts/refs preferred; status mutable |
| Payment Workflow | Sparelane (Payment Reliability Engine) | Operational DB | — | Bill ID | Confidential–Restricted | State-machine transitions only |
| Payment Attempt | Sparelane (Payment Attempt Service) | Operational DB | — | Provider transaction ID | Confidential–Restricted | Append-only / immutable completed attempts |
| Provider Transaction Reference | **PSP** authoritative; Sparelane mirrors | Operational DB | — | PSP txn ID | Confidential–Restricted | Mirror updates via verified webhooks |
| Wallet State | Sparelane Funds & Ledger (balances derived) | Ledger DB (+ ops metadata TBD) | Balance Service from journal | — | Restricted / Financial | Derived; journal append-only |
| Journal Transaction | Sparelane Ledger | Ledger DB | — | Payment/settlement refs | Restricted / Financial | Append-only |
| Journal Entry | Sparelane Ledger | Ledger DB | — | Account, amount, txn | Restricted / Financial | Append-only; corrections via compensating entries |
| Merchant Payable | Sparelane Ledger (derived) | Ledger DB | Balance Service | Merchant ID | Restricted / Financial | Derived |
| Settlement | Sparelane Settlement Domain | Operational + Ledger as appropriate | — | Banking provider refs | Restricted / Financial | Lifecycle transitions; not payment workflow |
| Settlement Instruction | Sparelane Settlement Instruction Service; partner executes | Operational / Ledger refs | — | Provider instruction ID | Restricted / Financial | Idempotent submit; unknown-outcome handling |
| Merchant Webhook Event | Sparelane (Webhook Delivery) as external contract | Operational DB | Curated from domain events | Stable event ID | Confidential | Immutable event payload once issued |
| Webhook Delivery Attempt | Sparelane Webhook Delivery | Operational DB | — | Event ID | Internal–Confidential | Append attempts |
| Audit Event | Sparelane Audit Service | Audit Store | — | Correlation IDs | Restricted | Append-only |
| KYC/KYB evidence | Provider + Sparelane restricted store | Object Storage / provider | — | Provider case IDs | Restricted | Retention TBD; access-restricted |
| Analytics data | Sparelane Analytics (derived) | Analytics Store | From operational/domain events | Aggregate keys | Confidential (minimised) | Rebuildable; not SoT |

## Never authoritative in Sparelane

- Merchant subscription configuration
- Merchant invoice master
- Merchant customer account master
- Merchant product catalogue
- Merchant accounting ledger
- Raw PAN / CVV
- Analytics aggregates for payment/settlement decisions
