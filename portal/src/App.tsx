import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { HomePage } from './pages/HomePage'
import { ArchitectureSectionPage } from './pages/ArchitectureSectionPage'
import { DesignPage } from './pages/DesignPage'
import { DecisionsPage } from './pages/DecisionsPage'
import { ContractsPage } from './pages/ContractsPage'
import { OperationsPage } from './pages/OperationsPage'
import { ImplementationPage } from './pages/ImplementationPage'
import { RequirementsPage } from './pages/RequirementsPage'
import { RequirementDetailPage } from './pages/RequirementDetailPage'
import { RequirementsTraceabilityPage } from './pages/RequirementsTraceabilityPage'
import { DocsRoutePage } from './pages/DocsRoutePage'
import { DocPage } from './components/DocPage'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="architecture/:section" element={<ArchitectureSectionPage />} />
          <Route path="architecture" element={<Navigate to="/architecture/overview" replace />} />
          <Route path="design" element={<DesignPage />} />
          <Route
            path="design/mermaid-test"
            element={<DocPage docPath="design/portal-mermaid-test.md" title="Mermaid test" />}
          />
          <Route path="decisions" element={<DecisionsPage />} />
          <Route path="contracts" element={<ContractsPage />} />
          <Route path="operations" element={<OperationsPage />} />
          <Route path="implementation" element={<ImplementationPage />} />
          <Route path="requirements" element={<RequirementsPage />} />
          <Route path="requirements/traceability" element={<RequirementsTraceabilityPage />} />
          <Route path="requirements/:id" element={<RequirementDetailPage />} />
          <Route path="docs/*" element={<DocsRoutePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
