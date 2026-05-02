import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Zap, Sparkles, History, LayoutDashboard,
  CreditCard, LogOut, Menu, X, ChevronRight
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/app/generate', icon: Sparkles, label: 'Generate' },
  { to: '/app/history', icon: History, label: 'History' },
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
];

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/');
  };

  const isPro = user?.plan === 'PRO';

  const SidebarContent = () => (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%', padding: '20px 0',
    }}>
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px', marginBottom: 32,
      }}>
        <div style={{
          width: 32, height: 32, background: 'var(--accent)', borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Zap size={18} color="white" fill="white" />
        </div>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>RepurposeAI</span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, padding: '0 12px' }}>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to} to={to}
            onClick={() => setMobileOpen(false)}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 'var(--radius)',
              fontSize: 14, fontWeight: 500, transition: 'all 0.15s',
              background: isActive ? 'var(--accent-light)' : 'transparent',
              color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
            })}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Plan info */}
      <div style={{ padding: '12px 12px 0' }}>
        {!isPro && (
          <div style={{
            background: 'var(--accent-light)', border: '1px solid rgba(124,109,250,0.3)',
            borderRadius: 'var(--radius)', padding: 14, marginBottom: 8,
          }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', marginBottom: 4 }}>
              Free Plan
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
              {user?.dailyUsageCount || 0}/3 generations today
            </p>
            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', fontSize: 12, padding: '8px' }}
              onClick={() => { navigate('/pricing'); setMobileOpen(false); }}
            >
              Upgrade to Pro <ChevronRight size={13} />
            </button>
          </div>
        )}

        {isPro && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(124,109,250,0.15), rgba(167,139,250,0.1))',
            border: '1px solid rgba(124,109,250,0.3)',
            borderRadius: 'var(--radius)', padding: 12, marginBottom: 8,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="badge badge-pro" style={{ fontSize: 10 }}>PRO</span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Unlimited</span>
            </div>
          </div>
        )}

        {/* User + logout */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px', borderTop: '1px solid var(--border)', marginTop: 4,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 99,
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 600, color: 'white', flexShrink: 0,
          }}>
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-ghost"
            style={{ padding: 6, color: 'var(--text-muted)' }}
            title="Logout"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Desktop Sidebar */}
      <aside style={{
        width: 230, flexShrink: 0,
        background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
      }}>
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 40,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside style={{
        position: 'fixed', left: mobileOpen ? 0 : -260, top: 0, bottom: 0,
        width: 240, zIndex: 50, transition: 'left 0.25s ease',
        background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)',
      }}>
        <button
          onClick={() => setMobileOpen(false)}
          style={{ position: 'absolute', top: 16, right: 16, background: 'none', color: 'var(--text-muted)' }}
        >
          <X size={18} />
        </button>
        <SidebarContent />
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Mobile header */}
        <div style={{
          display: 'none',
          padding: '16px 20px', borderBottom: '1px solid var(--border)',
          alignItems: 'center', justifyContent: 'space-between',
        }} className="mobile-header">
          <button onClick={() => setMobileOpen(true)} style={{ background: 'none', color: 'var(--text-primary)' }}>
            <Menu size={20} />
          </button>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>RepurposeAI</span>
          <div style={{ width: 24 }} />
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '0' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
