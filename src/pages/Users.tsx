import { useApp } from '../store/AppContext';
import { 
  Users as UsersIcon, 
  Search, 
  Plus, 
  MoreVertical, 
  Shield, 
  Mail, 
  Clock,
  ShieldCheck,
  Stethoscope,
  Hospital
} from 'lucide-react';
import { cn } from '../lib/utils';
import { UserRole } from '../types';

export default function Users() {
  const { user } = useApp();

  const mockUsers = [
    { id: '1', name: 'Dr. Sarah Jenkins', role: 'DOCTOR' as UserRole, status: 'ACTIVE', lastActive: '2m ago' },
    { id: '2', name: 'Ph. Alice Wong', role: 'PHARMACIST' as UserRole, status: 'ACTIVE', lastActive: '15m ago' },
    { id: '3', name: 'Dr. Michael Scott', role: 'DOCTOR' as UserRole, status: 'AWAY', lastActive: '4h ago' },
    { id: '4', name: 'James Halpert', role: 'ADMIN' as UserRole, status: 'ACTIVE', lastActive: '1m ago' },
    { id: '5', name: 'Ph. Dwight Schrute', role: 'PHARMACIST' as UserRole, status: 'OFFLINE', lastActive: '2d ago' },
  ];

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'DOCTOR': return <Stethoscope size={16} className="text-primary" />;
      case 'PHARMACIST': return <Hospital size={16} className="text-secondary" />;
      case 'ADMIN': return <Shield size={16} className="text-amber-500" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="font-display text-4xl font-bold text-slate-900 mb-2">Staff Directory</h2>
          <p className="text-lg text-slate-500 font-medium">Manage clinical staff roles and access permissions.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white h-12 px-6 rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20">
          <Plus size={20} />
          Invite Associate
        </button>
      </header>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <header className="px-8 py-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative flex-1 max-w-sm w-full group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary" />
            <input 
              type="text" 
              placeholder="Filter by name or role..."
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:border-primary transition-all font-medium"
            />
          </div>
        </header>

        <div className="overflow-x-auto text-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <th className="px-8 py-4">Professional</th>
                <th className="px-8 py-4">Credential / Role</th>
                <th className="px-8 py-4">System Status</th>
                <th className="px-8 py-4">Last Activity</th>
                <th className="px-8 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {mockUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-primary font-bold overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-50">
                        {u.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{u.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{u.role} NODE ACCESS</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className={cn(
                      "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                      u.role === 'DOCTOR' ? "bg-primary/5 text-primary border-primary/20" :
                      u.role === 'PHARMACIST' ? "bg-secondary/5 text-secondary border-secondary/20" :
                      "bg-amber-100 text-amber-700 border-amber-200"
                    )}>
                      {getRoleIcon(u.role)}
                      {u.role}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       <span className={cn(
                         "w-2 h-2 rounded-full",
                         u.status === 'ACTIVE' ? "bg-secondary" :
                         u.status === 'AWAY' ? "bg-amber-400" : "bg-slate-300"
                       )} />
                       <span className="font-bold text-slate-900">{u.status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-slate-500 flex items-center gap-2">
                    <Clock size={14} className="opacity-40" />
                    <span className="font-medium">{u.lastActive}</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2 text-slate-300 hover:text-slate-600 transition-opacity opacity-0 group-hover:opacity-100">
                      <MoreVertical size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-primary/5 rounded-3xl p-8 border border-primary/10 flex items-center gap-6">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm ring-1 ring-primary/5">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h4 className="font-display text-xl font-bold text-primary mb-1">Security Audit Clear</h4>
            <p className="text-sm text-slate-600 font-medium">All administrative privileges are currently synchronized with the central facility registry.</p>
          </div>
        </div>
        <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 flex items-center gap-6">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm ring-1 ring-slate-100">
            <Mail size={32} />
          </div>
          <div>
            <h4 className="font-display text-xl font-bold text-slate-900 mb-1">Pending Requests</h4>
            <p className="text-sm text-slate-600 font-medium">There are 0 pending staff invitation requests. Click "Invite Associate" to add new personnel.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
