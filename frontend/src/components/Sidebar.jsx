import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, LineChart, LogOut, AlertTriangle, Wallet, PieChart, Sparkles, Lightbulb, Zap } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { logout, user } = useContext(AuthContext);

  const links = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/expenses', icon: Receipt, label: 'Expenses' },
    { to: '/utilities', icon: Zap, label: 'Utilities' },
    { to: '/budget', icon: PieChart, label: 'Budget' },
    { to: '/leaks', icon: AlertTriangle, label: 'Money Leaks' },
    { to: '/analytics', icon: LineChart, label: 'Analytics' },
    { to: '/ai', icon: Sparkles, label: 'AI Insights' },
    { to: '/recommendations', icon: Lightbulb, label: 'Tips' },
  ];

  return (
    <aside style={{
      width: '260px',
      backgroundColor: 'var(--sidebar-bg)',
      color: '#A5B4FC',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      borderRight: 'none',
      zIndex: 50
    }}>
      <div style={{ height: '80px', display: 'flex', alignItems: 'center', padding: '0 2rem' }}>
        <div className="flex items-center gap-2">
          <Wallet className="w-6 h-6" style={{ color: 'var(--accent)' }} />
          <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>SmartSpend</span>
        </div>
      </div>

      <div style={{ padding: '1rem', flex: 1, overflowY: 'auto' }}>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  backgroundColor: isActive ? 'rgba(124, 58, 237, 0.3)' : 'transparent',
                  color: isActive ? 'white' : '#A5B4FC',
                  borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent'
                })}
              >
                {({ isActive }) => (
                  <>
                    <Icon className="w-5 h-5" style={{ color: isActive ? 'var(--accent)' : 'inherit' }} />
                    <span style={{ fontWeight: isActive ? '600' : '400' }}>{link.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'white', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user?.name}</div>
            <div style={{ fontSize: '0.75rem', color: '#A5B4FC', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user?.email}</div>
          </div>
        </div>
        <button
          onClick={logout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            color: '#F87171',
            backgroundColor: 'rgba(248, 113, 113, 0.1)',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontWeight: '600'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(248, 113, 113, 0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(248, 113, 113, 0.1)'}
        >
          <LogOut className="w-5 h-5" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
