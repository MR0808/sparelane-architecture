import { NavLink } from 'react-router-dom'
import { navItems } from '../lib/nav'

export function SideNav() {
  return (
    <nav className="portal-nav" aria-label="Portal">
      {navItems.map((item) => {
        if (item.children?.length) {
          return (
            <div className="nav-section" key={item.label}>
              <span className="nav-label">{item.label}</span>
              {item.children.map((child) => (
                <NavLink
                  key={child.to}
                  to={child.to}
                  end={child.to === '/requirements' || !child.to.includes('?')}
                  className={({ isActive }) => (isActive ? 'active' : undefined)}
                >
                  {child.label}
                </NavLink>
              ))}
            </div>
          )
        }
        return (
          <div className="nav-section" key={item.label}>
            <NavLink
              to={item.to!}
              end={item.to === '/'}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              {item.label}
            </NavLink>
          </div>
        )
      })}
    </nav>
  )
}
