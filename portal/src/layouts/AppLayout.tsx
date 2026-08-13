import { Link, Outlet } from 'react-router-dom'
import { SideNav } from '../components/SideNav'

export function AppLayout() {
  return (
    <div className="portal-shell">
      <header className="portal-header">
        <Link to="/" className="brand">
          <h1>Sparelane Architecture</h1>
        </Link>
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
