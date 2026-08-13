import { Link } from 'react-router-dom'
import { DocPage } from '../components/DocPage'

export function DesignPage() {
  return (
    <article>
      <h1 className="page-title">Design</h1>
      <p className="page-lead">
        Detailed Mermaid design diagrams <strong>supplement</strong> — they do not replace — LikeC4
        model-driven architecture views and dynamic flows.
      </p>
      <ul className="link-list">
        <li>
          <Link to="/design/mermaid-test">Sequence &amp; Detailed Diagrams (Mermaid test)</Link>
        </li>
        <li>
          <Link to="/architecture/overview">LikeC4 Architecture Map</Link>
        </li>
      </ul>
      <hr />
      <DocPage docPath="design/portal-mermaid-test.md" />
    </article>
  )
}
