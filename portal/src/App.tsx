import { lazy, Suspense, useCallback, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { HomePage } from './pages/HomePage'
import { ArchitectureSectionPage } from './pages/ArchitectureSectionPage'
import { ArchitectureViewPage } from './pages/ArchitectureViewPage'
import { DesignPage } from './pages/DesignPage'
import { DesignDetailPage } from './pages/DesignDetailPage'
import { DecisionsPage } from './pages/DecisionsPage'
import { OpenDecisionDetailPage } from './pages/OpenDecisionDetailPage'
import { ContractsPage } from './pages/ContractsPage'
import { OperationsPage } from './pages/OperationsPage'
import { ImplementationPage } from './pages/ImplementationPage'
import { RequirementsPage } from './pages/RequirementsPage'
import { RequirementDetailPage } from './pages/RequirementDetailPage'
import { RequirementsTraceabilityPage } from './pages/RequirementsTraceabilityPage'
import { TestsPage } from './pages/TestsPage'
import { TestDetailPage } from './pages/TestDetailPage'
import { HealthPage } from './pages/HealthPage'
import { SecurityPage } from './pages/SecurityPage'
import { DocsRoutePage } from './pages/DocsRoutePage'
import { DocPage } from './components/DocPage'
import { SearchDialog, useGlobalSearchShortcut } from './components/SearchDialog'

const ContractsApiPage = lazy(async () => {
  const mod = await import('./pages/ContractsApiPage')
  return { default: mod.ContractsApiPage }
})

function PortalRoutes() {
  const [searchOpen, setSearchOpen] = useState(false)
  const openSearch = useCallback(() => setSearchOpen(true), [])
  useGlobalSearchShortcut(openSearch)

  return (
    <>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      <Routes>
        <Route element={<AppLayout onOpenSearch={openSearch} />}>
          <Route index element={<HomePage />} />
          <Route path="architecture/view/:viewId" element={<ArchitectureViewPage />} />
          <Route path="architecture/:section" element={<ArchitectureSectionPage />} />
          <Route path="architecture" element={<Navigate to="/architecture/overview" replace />} />
          <Route path="design" element={<DesignPage />} />
          <Route
            path="design/mermaid-test"
            element={
              <DocPage
                docPath="design/portal-mermaid-test.md"
                title="Portal Rendering Test"
              />
            }
          />
          <Route path="design/:id" element={<DesignDetailPage />} />
          <Route path="requirements" element={<RequirementsPage />} />
          <Route path="requirements/traceability" element={<RequirementsTraceabilityPage />} />
          <Route path="requirements/:id" element={<RequirementDetailPage />} />
          <Route path="tests" element={<TestsPage />} />
          <Route path="tests/:id" element={<TestDetailPage />} />
          <Route path="decisions" element={<DecisionsPage />} />
          <Route path="decisions/open/:id" element={<OpenDecisionDetailPage />} />
          <Route path="contracts" element={<ContractsPage />} />
          <Route
            path="contracts/api"
            element={
              <Suspense fallback={<p className="page-lead">Loading API reference…</p>}>
                <ContractsApiPage />
              </Suspense>
            }
          />
          <Route path="security" element={<SecurityPage />} />
          <Route path="operations" element={<OperationsPage />} />
          <Route path="implementation" element={<ImplementationPage />} />
          <Route path="health" element={<HealthPage />} />
          <Route path="governance/health" element={<Navigate to="/health" replace />} />
          <Route path="docs/*" element={<DocsRoutePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <PortalRoutes />
    </BrowserRouter>
  )
}
