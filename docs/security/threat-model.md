# Threat Model

Structured threat analysis for Sparelane architecture (STRIDE-oriented). Residual risk is never claimed to be zero. Controls listed are architectural; vendor products and numeric thresholds remain TBD where noted.

## How to read entries

Each threat includes: affected assets, attack path, controls, residual risk, status.

---

## T-01 — Consumer account takeover

**STRIDE:** Spoofing, Elevation of Privilege  
**Assets:** consumer profile, payment methods, merchant connections  
**Attack path:** stolen session cookie; credential compromise; social engineering of recovery; malicious payment-method change after takeover  
**Controls:** MFA/passkeys where supported; session security; step-up for sensitive actions where appropriate; notifications/audit; ownership checks  
**Residual risk:** phishing and SIM-swap style attacks may still succeed without strong MFA; recovery-flow abuse remains a design focus  
**Status:** Controls proposed; IdP/MFA vendor TBD

## T-02 — Merchant credential theft

**STRIDE:** Spoofing, Information Disclosure, Tampering  
**Assets:** Merchant API, bills, settlement/status data, webhook configuration  
**Attack path:** leaked API secret; compromised merchant backend; secret in source control or logs  
**Controls:** scoped keys; one-time secret display; hash/reference storage; rotation/revocation; audit; rate limiting; environment isolation  
**Residual risk:** compromised live credentials can create fraudulent bills until revoked; merchant-side secret hygiene is a dependency  
**Status:** Architectural controls accepted in principle; detection thresholds TBD

## T-03 — Duplicate bill / payment replay

**STRIDE:** Tampering, Denial of Service (resource)  
**Assets:** bills, payment workflows, consumer funds experience  
**Attack path:** network retry of bill submit; replayed client requests; duplicated provider callbacks  
**Controls:** merchant API idempotency; stable identifiers; payment workflow state checks; provider event idempotency  
**Residual risk:** mis-implemented merchant idempotency keys or key collisions can still create operational noise  
**Status:** Controls modelled (ADR-008)

## T-04 — PSP webhook spoofing

**STRIDE:** Spoofing, Tampering  
**Assets:** payment attempt outcomes, collection state  
**Attack path:** forged provider webhook to mark payments collected/failed  
**Controls:** provider signature verification; timestamp/replay protection; event idempotency; reject + audit/monitor on failure  
**Residual risk:** provider signing-scheme bugs or leaked provider secrets; IP allowlists alone are insufficient  
**Status:** Required control; exact verification library TBD with PSP selection

## T-05 — Merchant webhook spoofing / tampering

**STRIDE:** Spoofing, Tampering  
**Assets:** merchant finance systems reacting to Sparelane events  
**Attack path:** attacker posts forged events to merchant endpoint  
**Controls:** HMAC-SHA256 (ADR-030); timestamp; stable event ID; SSRF denylist on outbound URL; secret shown once; merchant-side verification  
**Residual risk:** merchant fails to verify signatures; leaked signing secret  
**Status:** Controls Accepted (ADR-009 + ADR-030)

## T-05b — Outbound webhook SSRF

**STRIDE:** Information Disclosure, Elevation of Privilege (network)  
**Assets:** cloud metadata, internal network, webhook worker  
**Attack path:** merchant sets endpoint URL to loopback, RFC1918, or metadata  
**Controls:** HTTPS-only sandbox/production; DNS re-resolve; IP denylist; no redirects; local loopback sink opt-in only ([ADR-030](../decisions/ADR-030-merchant-webhook-contract-signing-and-delivery.md))  
**Residual risk:** novel IPv6/metadata aliases; DNS load-balancing races — re-check at connect  
**Status:** Controls Accepted (ADR-030)

## T-06 — Duplicate merchant settlement

**STRIDE:** Tampering, Repudiation  
**Assets:** merchant payable funds, banking instructions, ledger  
**Attack path:** retried settlement instruction after timeout; duplicate eligibility processing  
**Controls:** settlement idempotency; provider references; unknown-outcome query/reconcile before blind resubmit; ledger invariants  
**Residual risk:** partner-side duplicate execution in edge cases; operational lag during UNKNOWN  
**Status:** Controls modelled in money domain / ADR-005–006 family

## T-07 — Ledger tampering

**STRIDE:** Tampering, Repudiation  
**Assets:** financial journal, balances, settlement eligibility  
**Attack path:** privileged misuse; compromised service write path; direct DB mutation  
**Controls:** restricted write path; append-only semantics; balancing invariants; no admin UI direct ledger mutation; audit; reconciliation  
**Residual risk:** infrastructure-level DB compromise; insider threat with break-glass access  
**Status:** Logical controls defined; break-glass TBD

## T-08 — Privilege escalation

**STRIDE:** Elevation of Privilege  
**Assets:** admin portal, merchant data, financial operations  
**Attack path:** over-broad roles; stolen admin session; missing MFA  
**Controls:** least privilege; role separation; admin MFA; short-lived sessions; durable audit  
**Residual risk:** incorrect role grants; support tooling overreach  
**Status:** Principles defined; final role matrix TBD

## T-09 — Cross-merchant data leakage

**STRIDE:** Information Disclosure  
**Assets:** bills, payments, settlements, consumer connections per merchant  
**Attack path:** missing tenant filter; IDOR via merchant references; shared credential misuse  
**Controls:** tenant-scoped authorisation; explicit merchant context on API credentials; ownership checks; tests/controls  
**Residual risk:** application bugs remain the primary residual; continuous testing required  
**Status:** Required architectural rule; automated test programme TBD

## T-10 — Secret leakage

**STRIDE:** Information Disclosure  
**Assets:** PSP/bank/KYC credentials, webhook secrets, API keys, DB credentials  
**Attack path:** secrets in git; logged headers; debug dumps; over-broad secret access  
**Controls:** central secrets manager; no source-control secrets; redaction; least privilege; environment separation  
**Residual risk:** human error; compromised CI; vendor misconfiguration  
**Status:** ADR-011 proposed; vendor TBD

## T-11 — Denial of service / request flooding

**STRIDE:** Denial of Service  
**Assets:** Merchant API, webhook ingress, payment/settlement workers  
**Attack path:** credential stuffing; bill-submit loops; webhook floods; expensive query abuse  
**Controls:** rate limiting; queue isolation; bounded workloads; monitoring/alerting  
**Residual risk:** volumetric attacks above edge capacity; dependency on WAF/DDoS provider when selected  
**Status:** Logical controls defined; WAF/DDoS vendor and numeric limits TBD

## T-12 — Admin financial misuse

**STRIDE:** Tampering, Repudiation, Elevation of Privilege  
**Assets:** settlements, refunds/adjustments (future), merchant configuration  
**Attack path:** compromised or malicious privileged admin  
**Controls:** MFA; scoped roles; durable audit; no direct ledger UI mutation; financial permissions explicit  
**Residual risk:** insider threat; dual-control not yet mandated  
**Status:** Dual-control workflows TBD (ADR-012 covers auditability)

---

## Out of scope for this phase (explicit TBDs)

- formal SOC 2 / ISO 27001 control mappings
- regulatory licensing assessments
- penetration testing provider
- SIEM / WAF / DDoS / fraud vendor selection
- cryptographic KMS/HSM selection
- exact session TTLs and MFA implementation
