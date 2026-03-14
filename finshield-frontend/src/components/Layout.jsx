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
    <div style={{ display: 'flex', minHeight: '100vh', background: '#020b0f', position: 'relative' }}>

      {/* Cyber grid */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 20 }}
        />
      )}

      {/* SIDEBAR */}
      <aside style={{
        position: 'fixed', top: 0, left: 0, height: '100%',
        width: '220px',
        background: 'rgba(2,11,8,0.97)',
        borderRight: '1px solid #0a2a1a',
        display: 'flex', flexDirection: 'column',
        zIndex: 30,
        backdropFilter: 'blur(12px)',
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease',
      }}
        className="lg-sidebar"
      >
        <style>{`
          @media (min-width: 1024px) {
            .lg-sidebar { transform: translateX(0) !important; position: relative !important; }
            .lg-hide { display: none !important; }
            .lg-ml { margin-left: 220px; }
          }
          @media (max-width: 1023px) {
            .lg-ml { margin-left: 0; }
          }
          .nav-link-item { text-decoration: none; }
          .nav-link-item:hover > div { background: rgba(0,255,136,0.06) !important; color: #52b788 !important; border-color: rgba(0,255,136,0.12) !important; transform: translateX(3px); }
          .nav-link-item:hover .nav-icon-box { border-color: rgba(0,255,136,0.2) !important; background: rgba(0,255,136,0.06) !important; }
          .stat-card { transition: all 0.25s ease; cursor: default; }
          .stat-card:hover { transform: translateY(-3px); }
          .stat-card:hover .stat-icon-box { transform: scale(1.15); }
          .activity-card { transition: all 0.25s ease; cursor: default; }
          .activity-card.suspicious-card:hover { border-color: rgba(255,68,68,0.3) !important; box-shadow: 0 4px 24px rgba(255,68,68,0.08); transform: translateX(4px); }
          .activity-card.normal-card:hover { border-color: rgba(0,255,136,0.2) !important; box-shadow: 0 4px 24px rgba(0,255,136,0.06); transform: translateX(4px); }
          .activity-card:hover .card-icon-box { transform: scale(1.1); }
          .activity-card:hover .type-badge { border-color: rgba(0,255,136,0.15) !important; color: #52b788 !important; }
          .btn-neon-red { background: rgba(255,68,68,0.08); border: 1px solid rgba(255,68,68,0.35); color: #ff6b6b; font-family: 'Rajdhani', sans-serif; font-size: 14px; font-weight: 700; letter-spacing: 0.06em; cursor: pointer; transition: all 0.25s ease; display: flex; align-items: center; gap: 8px; }
          .btn-neon-red:hover { background: rgba(255,68,68,0.18); border-color: rgba(255,68,68,0.7); box-shadow: 0 0 22px rgba(255,68,68,0.25); transform: translateY(-2px); }
          .btn-neon-red:active { transform: translateY(0); box-shadow: none; }
          .btn-neon-green { background: rgba(0,255,136,0.05); border: 1px solid rgba(0,255,136,0.25); color: #00ff88; font-family: 'Rajdhani', sans-serif; font-size: 14px; font-weight: 700; letter-spacing: 0.06em; cursor: pointer; transition: all 0.25s ease; display: flex; align-items: center; gap: 8px; }
          .btn-neon-green:hover { background: rgba(0,255,136,0.12); border-color: rgba(0,255,136,0.5); box-shadow: 0 0 18px rgba(0,255,136,0.2); transform: translateY(-2px); }
          .btn-neon-green:active { transform: translateY(0); }
          .btn-neon-indigo { background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.4); color: #a5b4fc; font-family: 'Rajdhani', sans-serif; font-size: 14px; font-weight: 700; letter-spacing: 0.06em; cursor: pointer; transition: all 0.25s ease; display: flex; align-items: center; gap: 8px; }
          .btn-neon-indigo:hover { background: rgba(99,102,241,0.18); border-color: rgba(99,102,241,0.7); box-shadow: 0 0 20px rgba(99,102,241,0.2); transform: translateY(-2px); }
          .btn-neon-indigo:active { transform: translateY(0); }
          .btn-ghost { background: rgba(255,255,255,0.03); border: 1px solid #0a2a1a; color: #2d6a4f; font-family: 'Rajdhani', sans-serif; font-size: 14px; font-weight: 700; letter-spacing: 0.06em; cursor: pointer; transition: all 0.25s ease; display: flex; align-items: center; gap: 8px; }
          .btn-ghost:hover { background: rgba(255,255,255,0.06); border-color: #1a4d2e; color: #52b788; }
          .pan-card-hover { transition: all 0.25s ease; }
          .pan-card-hover:hover { border-color: rgba(0,255,136,0.3) !important; box-shadow: 0 0 20px rgba(0,255,136,0.1) !important; }
          .monitor-pill-hover { transition: all 0.25s ease; }
          .monitor-pill-hover:hover { box-shadow: 0 0 20px rgba(0,255,136,0.15) !important; border-color: rgba(0,255,136,0.35) !important; }
          .cyber-card { background: rgba(255,255,255,0.02); border: 1px solid #0a2a1a; border-radius: 14px; backdrop-filter: blur(10px); transition: all 0.25s ease; }
          .otp-input:focus { border-color: rgba(0,255,136,0.5) !important; box-shadow: 0 0 14px rgba(0,255,136,0.15) !important; outline: none; }
          .form-input:focus { border-color: rgba(0,255,136,0.4) !important; box-shadow: 0 0 10px rgba(0,255,136,0.08) !important; outline: none; }
          .form-input-error:focus { border-color: rgba(255,68,68,0.5) !important; outline: none; }
          @keyframes blink { 0%,100%{opacity:1;box-shadow:0 0 8px #00ff88}50%{opacity:0.3;box-shadow:none} }
          @keyframes slideIn { from{opacity:0;transform:translateY(-16px)}to{opacity:1;transform:translateY(0)} }
          @keyframes spin { to{transform:rotate(360deg)} }
          .animate-slide-in { animation: slideIn 0.35s ease forwards; }
          .animate-spin { animation: spin 1s linear infinite; }
          ::-webkit-scrollbar{width:4px}
          ::-webkit-scrollbar-track{background:#020b0f}
          ::-webkit-scrollbar-thumb{background:#0a2a1a;border-radius:2px}
          ::-webkit-scrollbar-thumb:hover{background:rgba(0,255,136,0.2)}
        `}</style>

        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #0a2a1a', display: 'flex', alignItems: 'center', gap: '11px' }}>
          <div style={{
            width: '38px', height: '38px', border: '1.5px solid #00ff88',
            borderRadius: '10px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '18px', flexShrink: 0,
            background: 'rgba(0,255,136,0.05)',
            boxShadow: '0 0 14px rgba(0,255,136,0.3)',
          }}>🛡️</div>
          <div>
            <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '13px', fontWeight: 900, color: '#00ff88', letterSpacing: '2px', textShadow: '0 0 10px rgba(0,255,136,0.5)' }}>
              FinShield
            </p>
            <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '10px', color: '#1a4d2e', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '2px' }}>
              Identity Protection
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item, i) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className="nav-link-item"
              style={({ isActive }) => ({
                display: 'block',
              })}
            >
              {({ isActive }) => (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px', borderRadius: '9px',
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: '14px', fontWeight: 600,
                  letterSpacing: '0.05em',
                  color: isActive ? '#00ff88' : '#2d6a4f',
                  background: isActive ? 'rgba(0,255,136,0.08)' : 'transparent',
                  border: isActive ? '1px solid rgba(0,255,136,0.2)' : '1px solid transparent',
                  position: 'relative',
                  transition: 'all 0.25s ease',
                }}>
                  {isActive && (
                    <span style={{
                      position: 'absolute', left: '-1px', top: '50%',
                      transform: 'translateY(-50%)',
                      width: '3px', height: '20px',
                      background: '#00ff88', borderRadius: '0 3px 3px 0',
                      boxShadow: '0 0 10px #00ff88',
                    }} />
                  )}
                  <span
                    className="nav-icon-box"
                    style={{
                      width: '28px', height: '28px', borderRadius: '7px',
                      background: isActive ? 'rgba(0,255,136,0.08)' : 'rgba(255,255,255,0.03)',
                      border: isActive ? '1px solid rgba(0,255,136,0.35)' : '1px solid #0a2a1a',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', flexShrink: 0,
                      boxShadow: isActive ? '0 0 8px rgba(0,255,136,0.2)' : 'none',
                      transition: 'all 0.25s ease',
                    }}
                  >{item.icon}</span>
                  {item.label}
                  {i === 0 && (
                    <span style={{
                      width: '7px', height: '7px', borderRadius: '50%',
                      background: '#00ff88', marginLeft: 'auto',
                      boxShadow: '0 0 8px #00ff88',
                      animation: 'blink 1.5s infinite',
                      display: 'inline-block',
                    }} />
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* PAN card */}
        <div style={{ padding: '14px', borderTop: '1px solid #0a2a1a' }}>
          <div
            className="pan-card-hover"
            style={{
              background: 'rgba(0,255,136,0.04)',
              border: '1px solid rgba(0,255,136,0.15)',
              borderRadius: '10px', padding: '12px 14px',
              boxShadow: '0 0 14px rgba(0,255,136,0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '10px', color: '#1a4d2e', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Your PAN
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: "'Rajdhani', sans-serif", fontSize: '10px', color: '#00ff88', fontWeight: 700 }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 6px #00ff88', animation: 'blink 2s infinite', display: 'inline-block' }} />
                ACTIVE
              </span>
            </div>
            <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '13px', color: '#00ff88', fontWeight: 700, letterSpacing: '0.1em', textShadow: '0 0 8px rgba(0,255,136,0.4)' }}>
              ABCDE1234F
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', color: '#1a4d2e', marginTop: '3px' }}>
              Demo Mode · All features enabled
            </p>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="lg-ml" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative', zIndex: 1 }}>

        {/* Mobile topbar */}
        <header
          className="lg-hide"
          style={{
            height: '56px', display: 'flex', alignItems: 'center', gap: '14px',
            padding: '0 16px',
            background: 'rgba(2,11,8,0.97)',
            borderBottom: '1px solid #0a2a1a',
            backdropFilter: 'blur(12px)',
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ background: 'none', border: 'none', color: '#00ff88', fontSize: '20px', cursor: 'pointer' }}
          >☰</button>
          <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '13px', color: '#00ff88', fontWeight: 900, letterSpacing: '2px' }}>
            FINSHIELD
          </span>
        </header>

        <main style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}