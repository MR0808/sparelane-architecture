import { Link } from 'react-router-dom'

export function ImplementationPage() {
  return (
    <article>
      <h1 className="page-title">Implementation</h1>
      <p className="page-lead">
        Engineering blueprint for <code>sparelane-platform</code>. Architecture Accepted is not
        product implemented. Phase D proves FakePSP collection reliability —{' '}
        <strong>COLLECTED → ledger posting NOT YET IMPLEMENTED</strong>.
      </p>

      <div className="card-grid">
        <div className="info-card">
          <strong>Phase A</strong>
          <span>Platform Foundation</span>
          <span>PASS WITH DOCUMENTED NON-BLOCKING RISKS</span>
          <span>A0–A9 complete</span>
          <Link to="/docs/implementation/phase-a-status">Phase A status</Link>
        </div>
        <div className="info-card">
          <strong>Phase B</strong>
          <span>Merchant + Consumer Core</span>
          <span>PASS WITH DOCUMENTED NON-BLOCKING RISKS</span>
          <span>B0–B6 complete · no money movement</span>
          <Link to="/docs/implementation/phase-b-status">Phase B status</Link>
        </div>
        <div className="info-card">
          <strong>Phase C</strong>
          <span>Bill Ingestion</span>
          <span>PASS WITH DOCUMENTED NON-BLOCKING RISKS</span>
          <span>C0–C5 · API key · POST Bill · idempotency · workflow · GET · no money</span>
          <Link to="/docs/implementation/phase-c-status">Phase C status</Link>
        </div>
        <div className="info-card">
          <strong>Phase D</strong>
          <span>Payment Reliability Engine</span>
          <span>PASS WITH DOCUMENTED NON-BLOCKING RISKS</span>
          <span>
            D0–D7 · attempts · primary/backup · FakePSP · retry · Retry Now · cutoff · no ledger
          </span>
          <Link to="/docs/implementation/phase-d-status">Phase D status</Link>
        </div>
        <div className="info-card">
          <strong>Phase E</strong>
          <span>Ledger</span>
          <span>NOT STARTED</span>
          <Link to="/docs/implementation/build-phases">Build phases</Link>
        </div>
      </div>

      <h2>Phase D at a glance</h2>
      <ul className="link-list">
        <li>
          Engineering decomposition D0–D7 (not additional canonical architecture phases)
        </li>
        <li>
          Implemented: payment attempts, primary/backup recovery, PSP adapter + FakePSP, retry
          scheduling, Retry Now, cutoff/failure, UNKNOWN block
        </li>
        <li>
          Boundary: <code>COLLECTED</code> → <code>ledgerPostingStatus=PENDING</code> →{' '}
          <code>PaymentCollected</code> — ledger posting not yet implemented
        </li>
        <li>
          Not implemented: journal entries, settlement, UNKNOWN reconciliation worker, real PSP,
          wallet financial flows
        </li>
        <li>
          <Link to="/docs/decisions/open-decisions">Open decisions</Link> remain (OD-003, OD-008,
          OD-010, OD-017, …)
        </li>
        <li>
          <Link to="/docs/implementation/architecture-traceability">Traceability</Link> ·{' '}
          <Link to="/docs/implementation/mvp-acceptance-criteria">MVP acceptance</Link> (not passed)
        </li>
      </ul>

      <h2>Phase C at a glance</h2>
      <ul className="link-list">
        <li>Engineering decomposition C0–C5 (not additional canonical architecture phases)</li>
        <li>
          Implemented: merchant machine auth, POST Bill (201), idempotency, Bill + 1:1 workflow,
          BillAccepted outbox, GET Bill, tenant/concurrency hardening
        </li>
        <li>
          Not implemented in Phase C: payment attempts (now Phase D), ledger, settlement
        </li>
      </ul>

      <h2>Phase B at a glance</h2>
      <ul className="link-list">
        <li>Engineering decomposition B0–B6 (not canonical architecture phases)</li>
        <li>
          Implemented/partial: merchant core, consumer core, explicit connections, payment-method
          token references, priority configuration, portal foundations
        </li>
        <li>
          Not implemented in Phase B: bills (Phase C), payment execution (Phase D), ledger,
          settlement
        </li>
      </ul>

      <h2>Status vocabulary</h2>
      <p className="page-lead">
        Designed ≠ foundation implemented ≠ product implemented ≠ verified. See{' '}
        <Link to="/docs/implementation/implementation-status">implementation status</Link>.
      </p>

      <h2>Blueprint</h2>
      <ul className="link-list">
        <li>
          <Link to="/docs/implementation/README">Implementation README</Link>
        </li>
        <li>
          <Link to="/docs/implementation/architecture-traceability">Architecture traceability</Link>
        </li>
        <li>
          <Link to="/docs/implementation/mvp-acceptance-criteria">MVP acceptance criteria</Link>
        </li>
        <li>
          <Link to="/docs/decisions/open-decisions">Open decisions</Link>
        </li>
        <li>
          <Link to="/architecture/implementation">Initial deployables (LikeC4)</Link>
        </li>
        <li>
          <Link to="/docs/implementation/repo-structure">Repo structure</Link>
        </li>
        <li>
          <Link to="/docs/implementation/modules">Module boundaries</Link>
        </li>
        <li>
          <Link to="/docs/implementation/module-dependencies">Module dependencies</Link>
        </li>
      </ul>
    </article>
  )
}
