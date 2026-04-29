import { useApp } from '../store/AppContext';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { 
  Stethoscope, 
  Hospital, 
  ShieldCheck, 
  User as UserIcon, 
  Lock, 
  ArrowRight, 
  Eye, 
  EyeOff,
  ShieldAlert
} from 'lucide-react';
import { cn } from '../lib/utils';
import { UserRole } from '../types';

export default function Login() {
  const { user, login, isLoading } = useApp();
  const [role, setRole] = useState<UserRole>('DOCTOR');
  const [showPassword, setShowPassword] = useState(false);

  if (user) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-surface">
      {/* Background blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary-container blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-surface-container-highest blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-5xl grid md:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        {/* Left Side: Branding */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-slate-50 relative overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-10">
            <img 
              src="https://images.unsplash.com/photo-1587854685352-25d82ae39e9e?auto=format&fit=crop&q=80&w=2000" 
              alt="Pharmacy" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary-container/20 to-surface-container-highest/40" />
          </div>

          <div className="relative z-10 flex items-center gap-2">
            <div className="bg-primary-container p-2 rounded-lg text-white">
              <Hospital size={24} fill="currentColor" />
            </div>
            <span className="font-display text-2xl font-extrabold text-primary">PharmaSmart</span>
          </div>

          <div className="relative z-10">
            <h1 className="font-display text-5xl font-bold leading-tight text-slate-900 mb-4">
              Systematic.<br />Secure.<br />Streamlined.
            </h1>
            <p className="text-lg text-slate-600 max-w-sm">
              Enterprise-grade inventory management for critical pharmaceutical supplies.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3 text-slate-500 font-medium">
            <ShieldAlert size={20} className="text-primary-container" />
            <span>End-to-end encrypted protocol</span>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-10 md:p-14 flex flex-col justify-center">
          <div className="mb-8 text-center md:text-left">
            <h2 className="font-display text-3xl font-bold text-slate-900 mb-2">Sign In</h2>
            <p className="text-slate-500">Access your clinical dashboard.</p>
          </div>

          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); login(role); }}>
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Role</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'DOCTOR' as UserRole, label: 'Doctor', icon: Stethoscope },
                  { id: 'PHARMACIST' as UserRole, label: 'Pharmacist', icon: Hospital },
                  { id: 'ADMIN' as UserRole, label: 'Admin', icon: ShieldCheck },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200",
                      role === r.id 
                        ? "border-primary bg-primary-container/5 text-primary shadow-sm" 
                        : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200 hover:bg-slate-100"
                    )}
                  >
                    <r.icon size={24} />
                    <span className="text-sm font-semibold">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Employee ID</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-primary transition-colors">
                    <UserIcon size={20} />
                  </div>
                  <input
                    type="text"
                    defaultValue="sarahJ_8829"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all font-medium"
                    placeholder="Enter ID"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Password</label>
                  <button type="button" className="text-xs font-bold text-primary hover:underline">Forgot?</button>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-primary transition-colors">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    defaultValue="password123"
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all font-medium"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Authenticate
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            <p className="text-center text-sm text-slate-500">
              Need assistance? <button type="button" className="text-primary font-bold hover:underline">Contact IT Support</button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
