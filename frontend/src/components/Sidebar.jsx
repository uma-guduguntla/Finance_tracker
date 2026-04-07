import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, LineChart, LogOut, Wallet } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { logout, user } = useContext(AuthContext);

  const links = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/expenses', icon: Receipt, label: 'Expenses' },
    { to: '/analytics', icon: LineChart, label: 'Analytics' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col fixed left-0 top-0">
      <div className="h-20 flex items-center px-8 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Wallet className="w-6 h-6 text-blue-600" />
          <span className="text-xl font-bold text-slate-800">Smart Spend</span>
        </div>
      </div>

      <div className="p-4 flex-1">
        <div className="mb-6 px-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Main Menu</p>
        </div>
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-100">
        <div className="px-4 py-3 mb-2">
           <div className="text-sm font-medium text-slate-800">{user?.name}</div>
           <div className="text-xs text-slate-500">{user?.email}</div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
