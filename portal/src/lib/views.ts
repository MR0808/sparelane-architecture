export type ArchitectureViewPage = {
  slug: string
  title: string
  description: string
  viewId: string
  relatedDocs?: { label: string; to: string }[]
}

/** Proof-of-concept embedded views — IDs match architecture/views.c4 and deployment.c4 */
export const architecturePages: ArchitectureViewPage[] = [
  {
    slug: 'overview',
    title: 'Overview',
    description:
      'Architecture map of major Sparelane domains. Use System Context for external actors and systems.',
    viewId: 'architectureMap',
    relatedDocs: [
      { label: 'System Context (LikeC4)', to: '/architecture/system-context' },
      { label: 'Start Here', to: '/docs/START-HERE' },
      { label: 'Architecture map (docs)', to: '/docs/architecture-map' },
      { label: 'Architecture principles', to: '/docs/architecture-principles' },
    ],
  },
  {
    slug: 'system-context',
    title: 'System Context',
    description: 'What Sparelane is and the external systems it interacts with.',
    viewId: 'index',
    relatedDocs: [
      { label: 'Architecture Map', to: '/architecture/overview' },
      { label: 'Start Here', to: '/docs/START-HERE' },
    ],
  },
  {
    slug: 'payments',
    title: 'Payments',
    description:
      'Payment Reliability Engine — orchestration, attempts, decline classification, and retries.',
    viewId: 'paymentEngineCore',
    relatedDocs: [{ label: 'Payment lifecycle', to: '/docs/payments/payment-lifecycle' }],
  },
  {
    slug: 'money',
    title: 'Money Movement',
    description: 'Funds, double-entry ledger, and settlement context.',
    viewId: 'fundsLedger',
    relatedDocs: [{ label: 'Ledger model', to: '/docs/money/ledger-model' }],
  },
  {
    slug: 'integrations',
    title: 'Integrations',
    description: 'Merchant API, hosted flow, widget, and signed webhooks.',
    viewId: 'merchantIntegration',
    relatedDocs: [{ label: 'Merchant API', to: '/docs/integrations/merchant-api' }],
  },
  {
    slug: 'security',
    title: 'Security',
    description: 'Trust boundaries between consumers, merchants, Sparelane, and providers.',
    viewId: 'trustBoundaries',
    relatedDocs: [
      { label: 'Threat model', to: '/docs/security/threat-model' },
      { label: 'Security index', to: '/docs/security/README' },
    ],
  },
  {
    slug: 'data',
    title: 'Data',
    description: 'Data architecture across operational, ledger, audit, and analytics stores.',
    viewId: 'dataArchitecture',
    relatedDocs: [{ label: 'Data index', to: '/docs/data/README' }],
  },
  {
    slug: 'deployment',
    title: 'Deployment',
    description: 'Logical production topology — web, API, workers, events, and data stores.',
    viewId: 'productionDeployment',
    relatedDocs: [{ label: 'Operations index', to: '/docs/operations/README' }],
  },
  {
    slug: 'implementation',
    title: 'Implementation (deployables)',
    description: 'Initial deployables for the modular platform (ADR-018).',
    viewId: 'implementationDeployables',
    relatedDocs: [
      { label: 'Implementation blueprint', to: '/implementation' },
      { label: 'Deployable mapping', to: '/docs/implementation/deployable-mapping' },
    ],
  },
]

export const proofViews = [
  { label: 'Architecture Map', viewId: 'architectureMap' },
  { label: 'System Context', viewId: 'index' },
  { label: 'Payment Reliability Engine / Core', viewId: 'paymentEngineCore' },
  { label: 'Funds & Ledger', viewId: 'fundsLedger' },
  { label: 'Trust Boundaries', viewId: 'trustBoundaries' },
  { label: 'Production Deployment', viewId: 'productionDeployment' },
  { label: 'Initial Deployables', viewId: 'implementationDeployables' },
] as const

export const diagramReactFlowProps = {
  zoomOnScroll: true,
  panOnScroll: false,
  panOnDrag: true,
  preventScrolling: true,
} as const
