import { useApp } from '../store/AppContext';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  AlertCircle,
  Stethoscope,
  ArrowRight,
  Plus,
  Box
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

const CHART_DATA = [
  { name: 'Mon', value: 400 },
  { name: 'Tue', value: 300 },
  { name: 'Wed', value: 200 },
  { name: 'Thu', value: 278 },
  { name: 'Fri', value: 189 },
  { name: 'Sat', value: 239 },
  { name: 'Sun', value: 349 },
];

export default function Dashboard() {
  const { user, prescriptions, medicines, alerts } = useApp();
  const navigate = useNavigate();

  const doctorContent = () => {
    const todayPrescriptions = prescriptions.filter(p => p.date === '2023-10-24').length;
    const pendingFulfillment = prescriptions.filter(p => p.status !== 'FULFILLED').length;

    return (
      <div className="space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div>
            <h2 className="font-display text-4xl font-bold text-slate-900 mb-2">Good morning, {user?.name.split(' ')[1]}</h2>
            <p className="text-lg text-slate-500">Here is your daily inventory and prescription overview.</p>
          </div>
          <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-50 flex items-center gap-3">
            <Clock size={18} className="text-primary" />
            <span className="font-medium text-slate-600">Oct 24, 2023</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4 bg-white rounded-3xl p-8 border border-slate-50 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <FileText size={80} className="text-primary" />
            </div>
            <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center mb-6">
              <CheckCircle2 size={24} className="text-primary" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Prescriptions Today</p>
            <div className="flex items-baseline gap-3">
              <h3 className="text-4xl font-bold text-slate-900">142</h3>
              <span className="flex items-center text-secondary font-bold text-sm bg-secondary/5 px-2 py-1 rounded-lg">
                <TrendingUp size={14} className="mr-1" /> 12%
              </span>
            </div>
          </div>

          <div className="md:col-span-4 bg-white rounded-3xl p-8 border border-slate-50 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <Clock size={80} className="text-error" />
            </div>
            <div className="w-12 h-12 bg-error/5 rounded-xl flex items-center justify-center mb-6">
              <AlertCircle size={24} className="text-error" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Pending Fulfillment</p>
            <div className="flex items-baseline gap-3">
              <h3 className="text-4xl font-bold text-slate-900">28</h3>
              <span className="text-error font-bold text-sm flex items-center gap-1">
                <AlertCircle size={14} /> 5 Requires Review
              </span>
            </div>
          </div>

          <div className="md:col-span-4 bg-primary rounded-3xl p-8 shadow-xl shadow-primary/20 text-white flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform" />
            <div className="relative z-10 mb-8">
              <h3 className="font-display text-2xl font-bold mb-2">Fast Track Creation</h3>
              <p className="text-sm text-white/70">Quickly generate a new prescription or refill an existing one.</p>
            </div>
            <button 
              onClick={() => navigate('/prescriptions')}
              className="relative z-10 bg-white text-primary px-6 py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
            >
              <Plus size={18} />
              Create Prescription
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-50 shadow-sm overflow-hidden">
          <header className="px-8 py-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-display text-xl font-bold">Recent Prescriptions</h3>
            <button className="text-primary font-bold text-sm hover:underline">View All</button>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <th className="px-8 py-4">Patient Name</th>
                  <th className="px-8 py-4">Medication (SKU)</th>
                  <th className="px-8 py-4">Date / Time</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {prescriptions.slice(0, 3).map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-5 font-bold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs text-primary font-bold">
                          {p.patientName.split(' ').map(n => n[0]).join('')}
                        </div>
                        {p.patientName}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="font-bold text-slate-900">{p.medicineName}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">SKU: {medicines.find(m => m.id === p.medicineId)?.sku}</p>
                    </td>
                    <td className="px-8 py-5 text-slate-500 font-medium">Today, {p.time}</td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        p.status === 'READY' ? "bg-secondary/10 text-secondary" :
                        p.status === 'PROCESSING' ? "bg-amber-100 text-amber-700" :
                        p.status === 'FULFILLED' ? "bg-primary/10 text-primary" :
                        "bg-error/10 text-error"
                      )}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="text-slate-300 hover:text-primary transition-opacity opacity-0 group-hover:opacity-100">
                        <ArrowRight size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const pharmacistContent = () => {
    const totalShelves = medicines.length;
    const criticalShelves = medicines.filter(m => m.status === 'CRITICAL').length;
    const lowShelves = medicines.filter(m => m.status === 'LOW').length;

    return (
      <div className="space-y-8 animate-in fade-in duration-700">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="font-display text-4xl font-bold text-slate-900 mb-2">Pharmacist Dashboard</h2>
            <p className="text-lg text-slate-500">Real-time inventory and shelf monitoring across the facility.</p>
          </div>
          <div className="flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-xl font-bold text-sm">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            SYSTEM ONLINE
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Shelves', val: totalShelves, color: 'primary', icon: Box },
            { label: 'Normal Stock', val: medicines.filter(m => m.status === 'NORMAL').length, color: 'secondary', icon: CheckCircle2 },
            { label: 'Low Stock', val: lowShelves, color: 'amber', icon: AlertCircle },
            { label: 'Critical Action', val: criticalShelves, color: 'error', icon: AlertCircle },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-3xl p-6 border border-slate-50 shadow-sm">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform hover:scale-110", `bg-${stat.color === 'amber' ? 'amber-500' : stat.color}/10`)}>
                <stat.icon size={20} className={stat.color === 'amber' ? 'text-amber-500' : `text-${stat.color}`} />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className={cn("text-3xl font-bold", stat.color === 'error' ? 'text-error' : 'text-slate-900')}>{stat.val}</h3>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 bg-white rounded-3xl p-8 border border-slate-50 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-display text-xl font-bold">Stock Consumption Trends</h3>
              <select className="bg-slate-50 border-none outline-none text-xs font-bold text-slate-500 rounded-lg px-3 py-2 cursor-pointer">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={CHART_DATA}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} dy={10} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    itemStyle={{fontWeight: 'bold', fontSize: '12px'}}
                  />
                  <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 bg-white rounded-3xl p-8 border border-slate-50 shadow-sm flex flex-col">
            <h3 className="font-display text-xl font-bold mb-8">Stock Distribution</h3>
            <div className="flex-1 flex flex-col justify-center gap-6">
              {medicines.slice(0, 4).map((med) => (
                <div key={med.id}>
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{med.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">SKU: {med.sku}</p>
                    </div>
                    <span className={cn("text-xs font-bold", med.status === 'NORMAL' ? 'text-slate-900' : 'text-error')}>
                      {med.quantity} Units
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full transition-all duration-1000", med.status === 'NORMAL' ? 'bg-primary' : 'bg-error')}
                      style={{ width: `${(med.quantity / med.capacity) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => navigate('/inventory')}
              className="mt-8 text-primary font-bold text-sm flex items-center justify-center gap-2 hover:underline"
            >
              Full Inventory Report
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const adminContent = () => {
    return (
      <div className="space-y-8 animate-in zoom-in-95 duration-500">
        <header>
          <h2 className="font-display text-4xl font-bold text-slate-900 mb-2">Systems Oversight</h2>
          <p className="text-lg text-slate-500">Global control and administrative metrics.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-50 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Active Users</p>
            <h3 className="text-4xl font-bold text-slate-900 mb-4">128</h3>
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-primary">
                  U{i}
                </div>
              ))}
              <div className="w-8 h-8 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-400">
                +123
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl p-8 border border-slate-50 shadow-sm border-l-4 border-l-error">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Open Vulnerabilities</p>
            <div className="flex items-center gap-4">
              <h3 className="text-4xl font-bold text-error">4</h3>
              <div className="bg-error/10 px-3 py-1 rounded-full text-[10px] font-bold text-error uppercase">Active</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-50 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Inventory Sync</p>
            <div className="flex items-center gap-4">
              <h3 className="text-4xl font-bold text-secondary">99%</h3>
              <div className="bg-secondary/10 px-3 py-1 rounded-full text-[10px] font-bold text-secondary uppercase">Healthy</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-50 shadow-sm">
          <h3 className="font-display text-xl font-bold mb-8">System Audit Logs (Simulated)</h3>
          <div className="space-y-4">
            {[
              { user: 'Dr. Sarah Jenkins', action: 'Created Prescription', time: '2m ago', details: 'Patient: Michael Rossi / Med: Amoxicillin' },
              { user: 'System', action: 'Low Stock Alert', time: '15m ago', details: 'Item: Amoxicillin dropped below 15 units' },
              { user: 'Admin', action: 'User Permissions Updated', time: '1h ago', details: 'Pharmacist Alice Wong access granted to Zone B' },
            ].map((log, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                  {log.action.includes('Alert') ? <AlertCircle size={20} className="text-error" /> : <Clock size={20} />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-slate-900">{log.user}</span>
                    <span className="text-[10px] font-bold text-slate-300 uppercase leading-none mt-0.5">•</span>
                    <span className="text-xs font-medium text-slate-400">{log.time}</span>
                  </div>
                  <p className="text-sm font-bold text-primary mb-1">{log.action}</p>
                  <p className="text-xs text-slate-500">{log.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {user?.role === 'DOCTOR' && doctorContent()}
      {user?.role === 'PHARMACIST' && pharmacistContent()}
      {user?.role === 'ADMIN' && adminContent()}
    </div>
  );
}
