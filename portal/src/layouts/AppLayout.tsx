import { Link, Outlet } from 'react-router-dom'
import { SideNav } from '../components/SideNav'

export function AppLayout({ onOpenSearch }: { onOpenSearch: () => void }) {
  return (
    <div className="portal-shell">
      <header className="portal-header">
        <Link to="/" className="brand">
          <h1>Sparelane Architecture</h1>
        </Link>
        <button type="button" className="search-trigger" onClick={onOpenSearch}>
          Search
          <kbd>Ctrl</kbd>
          <kbd>K</kbd>
        </button>
      </header>
      <div className="portal-body">
        <SideNav />
        <main className="portal-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
