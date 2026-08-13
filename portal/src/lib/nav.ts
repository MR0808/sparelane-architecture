export type NavChild = {
  label: string
  to: string
}

export type NavItem = {
  label: string
  to?: string
  children?: NavChild[]
}

export const navItems: NavItem[] = [
  { label: 'Home', to: '/' },
  {
    label: 'Architecture',
    children: [
      { label: 'Overview', to: '/architecture/overview' },
      { label: 'Payments', to: '/architecture/payments' },
      { label: 'Money Movement', to: '/architecture/money' },
      { label: 'Integrations', to: '/architecture/integrations' },
      { label: 'Security', to: '/architecture/security' },
      { label: 'Data', to: '/architecture/data' },
      { label: 'Deployment', to: '/architecture/deployment' },
      { label: 'Implementation', to: '/architecture/implementation' },
    ],
  },
  {
    label: 'Design',
    children: [{ label: 'Sequence & Detailed Diagrams', to: '/design' }],
  },
  {
    label: 'Requirements',
    children: [
      { label: 'Overview', to: '/requirements' },
      { label: 'Business', to: '/requirements?type=business' },
      { label: 'Functional', to: '/requirements?type=functional' },
      { label: 'Non-Functional', to: '/requirements?type=non-functional' },
      { label: 'Integrations', to: '/requirements?type=integration' },
      { label: 'Security', to: '/requirements?area=security' },
      { label: 'Traceability', to: '/requirements/traceability' },
    ],
  },
  { label: 'Decisions', to: '/decisions' },
  { label: 'Contracts', to: '/contracts' },
  { label: 'Operations', to: '/operations' },
  { label: 'Implementation', to: '/implementation' },
]
