import { useApp } from '../store/AppContext';
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Search, 
  Download, 
  Clock,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Alerts() {
  const { alerts, resolveAlert } = useApp();

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'UNAUTHORIZED': return <ShieldAlert size={24} className="text-error" />;
      case 'LOW_STOCK': return <AlertTriangle size={24} className="text-amber-500" />;
      case 'EXPIRY': return <AlertCircle size={24} className="text-orange-500" />;
      default: return <Info size={24} className="text-primary" />;
    }
  };

  const currentAlerts = alerts.filter(a => !a.resolved);
  const resolvedAlerts = alerts.filter(a => a.resolved);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="font-display text-4xl font-bold text-slate-900 mb-2">System Alerts</h2>
          <p className="text-lg text-slate-500 font-medium">Real-time monitoring of clinical inventory anomalies.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-50 text-slate-500 font-bold text-xs hover:bg-slate-50 transition-colors uppercase tracking-widest">
            <Download size={16} />
            Export Audit
          </button>
        </div>
      </header>

      <div className="space-y-6">
        <h3 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2">
          Critical Incidents
          {currentAlerts.length > 0 && (
            <span className="bg-error text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {currentAlerts.length}
            </span>
          )}
        </h3>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {currentAlerts.map((alert) => (
              <motion.div
                layout
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "bg-white rounded-3xl border shadow-sm p-8 flex flex-col md:flex-row gap-6 relative overflow-hidden",
                  alert.severity === 'HIGH' ? "border-error/20" : "border-amber-200"
                )}
              >
                {/* Visual marker */}
                <div className={cn(
                  "absolute left-0 top-0 bottom-0 w-1.5",
                  alert.severity === 'HIGH' ? "bg-error" : "bg-amber-400"
                )} />

                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0",
                  alert.severity === 'HIGH' ? "bg-error/5" : "bg-amber-50"
                )}>
                  {getAlertIcon(alert.type)}
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className={cn(
                        "font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full",
                        alert.severity === 'HIGH' ? "bg-error/10 text-error" : "bg-amber-100 text-amber-700"
                      )}>
                        {alert.type.replace('_', ' ')}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                        <Clock size={14} />
                        {alert.timestamp}
                      </span>
                    </div>
                    <h4 className="font-display text-2xl font-bold text-slate-900 mb-2">{alert.message}</h4>
                    <p className="text-slate-500 font-medium leading-relaxed max-w-3xl">{alert.details}</p>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    {alert.sku && (
                      <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Asset SKU</span>
                        <span className="font-mono text-sm font-bold text-slate-700">{alert.sku}</span>
                      </div>
                    )}
                    {alert.location && (
                      <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Monitoring Node</span>
                        <span className="font-mono text-sm font-bold text-slate-700">{alert.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3 justify-center shrink-0 w-full md:w-auto">
                  <button 
                    onClick={() => resolveAlert(alert.id)}
                    className="w-full md:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                  >
                    Mark Resolved
                  </button>
                  <button className="text-xs font-bold text-slate-400 hover:text-primary transition-colors text-center font-display">
                    View Forensic Log
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {currentAlerts.length === 0 && (
            <div className="bg-secondary/5 rounded-3xl p-16 text-center border-2 border-dashed border-secondary/20">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto text-secondary mb-4 shadow-sm">
                <CheckCircle2 size={32} />
              </div>
              <h4 className="font-display text-xl font-bold text-slate-900">All Nodes Secure</h4>
              <p className="text-slate-500 mt-2 font-medium">No active inventory anomalies detected in the last 24 hours.</p>
            </div>
          )}
        </div>

        {resolvedAlerts.length > 0 && (
          <div className="pt-12">
            <h3 className="font-display text-lg font-bold text-slate-400 mb-6 uppercase tracking-widest pl-1">Resolved Incident Log</h3>
            <div className="bg-white rounded-3xl border border-slate-50 shadow-sm overflow-hidden opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
              <div className="divide-y divide-slate-50">
                {resolvedAlerts.map(alert => (
                  <div key={alert.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{alert.message}</p>
                        <p className="text-xs text-slate-400 font-medium">Resolved on {new Date().toLocaleDateString()}</p>
                      </div>
                    </div>
                    <ArrowRight size={20} className="text-slate-200" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
