import { useParams } from 'react-router-dom'
import { DocPage } from '../components/DocPage'

export function DocsRoutePage() {
  const { '*': splat } = useParams()
  const docPath = splat || 'START-HERE'
  return <DocPage docPath={docPath} />
}
