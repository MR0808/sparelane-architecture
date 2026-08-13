# Security Trust Zones

Logical trust zones for Sparelane security architecture. These are **logical** boundaries for reviewers and engineers. They do not imply final physical network topology, VPC design or vendor choices.

## Public / Untrusted Internet

Actors and systems outside Sparelane control:

- Consumer browser
- Merchant browser
- Merchant Integration Backend
- Merchant webhook endpoints
- External identity providers
- External PSP / bank / KYC webhook sources (until verified)

Treat all traffic from this zone as untrusted until authenticated and authorised at the edge.

## Sparelane Edge Boundary

Public ingress into Sparelane:

- Consumer Web App / Hosted Flow / Merchant Widget entry
- Merchant Portal
- Merchant API
- Provider Webhook Ingress
- Admin Portal (still edge-facing; elevated controls apply after authentication)

Responsibilities:

- TLS termination
- authentication entry points
- request validation
- rate limiting and abuse controls
- provider webhook signature verification before trust
- merchant webhook signing on egress

## Authenticated Application Boundary

Internal application services reachable only after successful authentication and authorisation (consumer, merchant user, merchant machine, or admin contexts as applicable).

Examples:

- Consumer / Merchant / Admin backends
- Consumer Domain services
- Merchant Domain / Bill Management services
- Merchant Integration Service
- Notification services
- Identity and Authorisation services

## Financial Trust Zone

Highly sensitive logical boundary around money-movement controls:

- Payment Orchestrator
- Payment Attempt Service
- Double-entry Ledger
- Settlement Service
- Settlement Instruction Service
- Financial Ledger Database
- related financial operational records

Access and mutations are tightly constrained, auditable and permissioned. Admin UI must not provide unrestricted ledger mutation.

## Administrative Trust Zone

Internal privileged operations requiring elevated assurance:

- Sparelane Admin Portal / Admin Backend
- privileged support, risk and platform actions
- credential and integration configuration changes with elevated impact
- production secret access pathways

Requires MFA, short-lived sessions, explicit privileged roles and durable audit.

## PCI Provider Boundary

External. Contains:

- raw PAN
- CVV
- secure card-entry fields
- tokenisation

Sparelane application systems must not store raw PAN/CVV and must not intentionally receive or persist CVV.

## Banking / Settlement Partner Boundary

External partner that executes settlement instructions and returns settlement outcomes. Sparelane submits instructions with provider references/idempotency; the partner remains outside Sparelane trust for fund movement execution.

## KYC / KYB Provider Boundary

External verification provider used during merchant onboarding. Evidence may be referenced or stored under Restricted classification; raw identity evidence handling follows provider and retention rules (TBD).
