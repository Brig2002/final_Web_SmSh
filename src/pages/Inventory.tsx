import { useApp } from '../store/AppContext';
import { 
  Wifi, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  ChevronRight, 
  Filter,
  Package,
  History,
  MoreVertical
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Inventory() {
  const { medicines, updateInventory, user } = useApp();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
        <div>
          <h2 className="font-display text-4xl font-bold text-slate-900 mb-2">Real-Time Smart Shelves</h2>
          <p className="text-lg text-slate-500 font-medium">Live IoT monitoring of pharmacy inventory status.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-50 text-slate-500 font-bold text-xs">
          <Wifi size={14} className="text-secondary animate-pulse" />
          SYSTEM ONLINE
        </div>
      </header>

      {/* Grid Header & Filters */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-6">
        <h3 className="font-display text-xl font-bold text-slate-900">Active Shelf Monitors</h3>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-primary transition-colors uppercase tracking-widest">
            <Filter size={14} />
            Filter View
          </button>
          <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-primary transition-colors uppercase tracking-widest">
            <History size={14} />
            Scan History
          </button>
        </div>
      </div>

      {/* Shelves Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {medicines.map((med) => (
            <motion.div
              layout
              key={med.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={cn(
                "group bg-white rounded-3xl p-6 border-2 shadow-sm relative overflow-hidden flex flex-col gap-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300",
                med.status === 'CRITICAL' ? "border-error/20" :
                med.status === 'LOW' ? "border-amber-200" :
                "border-white"
              )}
            >
              {/* Highlight bar */}
              <div className={cn(
                "absolute top-0 left-0 right-0 h-1.5",
                med.status === 'CRITICAL' ? "bg-error" :
                med.status === 'LOW' ? "bg-amber-400" :
                "bg-secondary"
              )} />

              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">{med.shelfId}</span>
                  <div className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit",
                    med.status === 'CRITICAL' ? "bg-error/10 text-error" :
                    med.status === 'LOW' ? "bg-amber-100 text-amber-700" :
                    "bg-secondary/10 text-secondary"
                  )}>
                    {med.status === 'CRITICAL' && <AlertCircle size={12} />}
                    {med.status === 'LOW' && <Info size={12} />}
                    {med.status === 'NORMAL' && <CheckCircle2 size={12} />}
                    {med.status}
                  </div>
                </div>
                <button className="text-slate-300 hover:text-slate-600">
                  <MoreVertical size={20} />
                </button>
              </div>

              <div className="flex-1">
                <h4 className="font-display text-2xl font-bold text-slate-800 leading-tight mb-1">{med.name}</h4>
                <p className="text-xs font-medium text-slate-400">{med.description}</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className={cn(
                    "text-lg font-bold font-display",
                    med.status === 'CRITICAL' ? "text-error" : "text-slate-900"
                  )}>
                    {med.quantity} units remaining
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{med.capacity} capacity</span>
                </div>
                <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(med.quantity / med.capacity) * 100}%` }}
                    className={cn(
                      "h-full rounded-full transition-colors duration-500",
                      med.status === 'CRITICAL' ? "bg-error shadow-[0_0_10px_rgba(239,68,68,0.5)]" :
                      med.status === 'LOW' ? "bg-amber-400" :
                      "bg-secondary"
                    )}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                  <Wifi size={12} />
                  SYNC: LIVE
                </div>
                {user?.role !== 'DOCTOR' && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => updateInventory(med.id, Math.max(0, med.quantity - 1))}
                      className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"
                    >
                      Remove
                    </button>
                    <button 
                      onClick={() => updateInventory(med.id, Math.min(med.capacity, med.quantity + 5))}
                      className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors"
                    >
                      Restock
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
