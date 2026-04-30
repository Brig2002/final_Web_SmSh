import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { 
  LayoutDashboard, 
  Box, 
  FileText, 
  Bell, 
  Users as UsersIcon, 
  Search, 
  Settings, 
  HelpCircle, 
  LogOut,
  Plus,
  Hospital
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function Layout() {
  const { user, logout, alerts } = useApp();
  const navigate = useNavigate();

  if (!user) return null;

  const activeAlerts = alerts.filter(a => !a.resolved).length;

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Inventory', icon: Box, path: '/inventory' },
    { name: 'Prescriptions', icon: FileText, path: '/prescriptions' },
    { name: 'Alerts', icon: Bell, path: '/alerts', badge: activeAlerts },
  ];

  if (user.role === 'ADMIN') {
    navItems.push({ name: 'Users', icon: UsersIcon, path: '/users' });
  }

  return (
    <div className="flex h-screen bg-surface">
      {/* Desktop Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-100 flex flex-col z-30 shadow-sm">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-primary-container p-2 rounded-lg text-white">
              <Hospital size={24} fill="currentColor" />
            </div>
            <div>
              <h1 className="font-display text-xl font-extrabold text-primary leading-none">PharmaSmart</h1>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inventory Hub</span>
            </div>
          </div>

          {user.role === 'ADMIN' && (
            <button 
              onClick={() => navigate('/prescriptions')}
              className="w-full flex items-center justify-center gap-2 bg-primary py-3 rounded-xl text-white font-bold text-sm shadow-md shadow-primary/10 hover:opacity-90 transition-opacity mb-8"
            >
              <Plus size={18} />
              New Prescription
            </button>
          )}

          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all duration-200",
                  isActive 
                    ? "bg-primary-container/10 text-primary" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} />
                  <span>{item.name}</span>
                </div>
                {item.badge ? (
                  <span className="bg-error text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full">
                    {item.badge}
                  </span>
                ) : null}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User profile footer */}
        <div className="mt-auto p-6 border-t border-slate-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-surface-container-high border-2 border-white overflow-hidden flex items-center justify-center text-primary font-bold ring-1 ring-slate-100">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-error transition-colors text-sm font-medium"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-50 px-8 flex items-center justify-between z-20">
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search inventory, prescriptions, patients..."
                className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all text-sm font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-500">
            <button className="p-2 hover:bg-slate-50 rounded-full transition-colors relative">
              <Bell size={20} />
              {activeAlerts > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-white" />}
            </button>
            <button className="p-2 hover:bg-slate-50 rounded-full transition-colors">
              <HelpCircle size={20} />
            </button>
            <div className="w-px h-6 bg-slate-100 mx-2" />
            <button className="p-2 hover:bg-slate-50 rounded-full transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* Dynamic Page content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
