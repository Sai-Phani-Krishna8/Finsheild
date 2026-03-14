import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { path: '/dashboard', label: 'Live Feed',     icon: '📡' },
  { path: '/lock',      label: 'Identity Lock', icon: '🔒' },
  { path: '/risk',      label: 'AI Risk Score', icon: '🧠' },
  { path: '/report',    label: 'Fraud Report',  icon: '📄' },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-slate-950">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-slate-700 z-30
        flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>

        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-lg">
              🛡️
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-none">FinShield</p>
              <p className="text-slate-400 text-xs mt-0.5">Identity Protection</p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-4 flex flex-col gap-1">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <p className="text-slate-500 text-xs text-center">PAN: ABCDE1234F</p>
          <p className="text-slate-600 text-xs text-center mt-0.5">Demo Mode</p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center gap-4 px-4 py-3 bg-slate-900 border-b border-slate-700">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-400 hover:text-white p-1 text-xl"
          >
            ☰
          </button>
          <span className="text-white font-bold">FinShield</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}