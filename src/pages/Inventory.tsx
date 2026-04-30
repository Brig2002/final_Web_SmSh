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
import { useState } from 'react';
import { 
  getTotalQuantity, 
  getEarliestExpiryDate, 
  formatExpiryDate, 
  getDaysUntilExpiry,
  isExpired,
  isExpiryWarning
} from '../lib/utils';
import MedicineDetailsModal from '../components/MedicineDetailsModal';
import ShelfDetailsModal from '../components/ShelfDetailsModal';

export default function Inventory() {
  const { medicines, user } = useApp();
  const [selectedMedicine, setSelectedMedicine] = useState<string | null>(null);
  const [selectedShelf, setSelectedShelf] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'expiring' | 'expired'>('all');
  const [sortType, setSortType] = useState<'name' | 'expiry' | 'quantity'>('name');

  // Filter medicines
  const filteredMedicines = medicines.filter(med => {
    if (filterType === 'expired') {
      return med.status === 'EXPIRED';
    }
    if (filterType === 'expiring') {
      const earliestExpiry = getEarliestExpiryDate(med.batches);
      return earliestExpiry && isExpiryWarning(earliestExpiry, 14);
    }
    return true;
  });

  // Sort medicines
  const sortedMedicines = [...filteredMedicines].sort((a, b) => {
    if (sortType === 'name') {
      return a.name.localeCompare(b.name);
    }
    if (sortType === 'expiry') {
      const aExpiry = getEarliestExpiryDate(a.batches);
      const bExpiry = getEarliestExpiryDate(b.batches);
      if (!aExpiry) return 1;
      if (!bExpiry) return -1;
      return new Date(aExpiry).getTime() - new Date(bExpiry).getTime();
    }
    if (sortType === 'quantity') {
      return getTotalQuantity(b.batches) - getTotalQuantity(a.batches);
    }
    return 0;
  });

  const shelfGroups = sortedMedicines.reduce((groups, medicine) => {
    if (!groups[medicine.shelfId]) {
      groups[medicine.shelfId] = [];
    }
    groups[medicine.shelfId].push(medicine);
    return groups;
  }, {} as Record<string, typeof sortedMedicines>);

  const shelfEntries = Object.entries(shelfGroups).sort(([a], [b]) => a.localeCompare(b));

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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-2 border-b border-slate-100 mb-6 gap-4">
        <h3 className="font-display text-xl font-bold text-slate-900">Active Shelf Monitors</h3>
        <div className="flex flex-wrap items-center gap-3">
          {/* Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Filter:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:border-primary transition-colors"
            >
              <option value="all">All</option>
              <option value="expiring">Expires Soon (14d)</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Sort:</span>
            <select
              value={sortType}
              onChange={(e) => setSortType(e.target.value as any)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:border-primary transition-colors"
            >
              <option value="name">Name</option>
              <option value="expiry">Earliest Expiry</option>
              <option value="quantity">Quantity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Shelves Grid */}
      <div className="space-y-8">
        <AnimatePresence mode="popLayout">
          {shelfEntries.map(([shelfId, shelfMedicines]) => (
            <motion.section
              layout
              key={shelfId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="space-y-4"
            >
              <button
                onClick={() => setSelectedShelf(shelfId)}
                className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl border-2 border-slate-200 hover:border-primary hover:from-slate-100 hover:to-slate-50 transition-all duration-200 group cursor-pointer"
              >
                <div className="flex-1 text-left">
                  <h4 className="font-display text-2xl font-bold text-slate-900 group-hover:text-primary transition-colors">{shelfId}</h4>
                  <p className="text-sm text-slate-500 font-medium mt-1">
                    {shelfMedicines.length} medicine{shelfMedicines.length === 1 ? '' : 's'} stored on this shelf
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:bg-primary group-hover:text-white transition-colors">
                    View details
                  </span>
                  <ChevronRight size={20} className="text-slate-400 group-hover:text-primary transition-colors" />
                </div>
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shelfMedicines.map((med) => {
            const totalQty = getTotalQuantity(med.batches);
            const earliestExpiry = getEarliestExpiryDate(med.batches);
            const isExp = earliestExpiry ? isExpired(earliestExpiry) : false;
            const isWarning = earliestExpiry ? isExpiryWarning(earliestExpiry, 14) : false;
            const daysUntilExpiry = earliestExpiry ? getDaysUntilExpiry(earliestExpiry) : null;

                    return (
                      <motion.div
                        layout
                        key={med.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onClick={() => setSelectedMedicine(med.id)}
                        className={cn(
                          "group bg-white rounded-3xl p-6 border-2 shadow-sm relative overflow-hidden flex flex-col gap-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer",
                          med.status === 'CRITICAL' ? "border-error/20" :
                          med.status === 'LOW' ? "border-amber-200" :
                          med.status === 'EXPIRED' ? "border-red-200" :
                          "border-white"
                        )}
                      >
                {/* Highlight bar */}
                <div className={cn(
                  "absolute top-0 left-0 right-0 h-1.5",
                  med.status === 'CRITICAL' ? "bg-error" :
                  med.status === 'LOW' ? "bg-amber-400" :
                  med.status === 'EXPIRED' ? "bg-red-500" :
                  "bg-secondary"
                )} />

                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">{med.shelfId}</span>
                    <div className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit",
                      med.status === 'CRITICAL' ? "bg-error/10 text-error" :
                      med.status === 'LOW' ? "bg-amber-100 text-amber-700" :
                      med.status === 'EXPIRED' ? "bg-red-100 text-red-700" :
                      "bg-secondary/10 text-secondary"
                    )}>
                      {med.status === 'CRITICAL' && <AlertCircle size={12} />}
                      {med.status === 'LOW' && <Info size={12} />}
                      {med.status === 'EXPIRED' && <AlertCircle size={12} />}
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
                      {totalQty} units
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{med.capacity} capacity</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(totalQty / med.capacity) * 100}%` }}
                      className={cn(
                        "h-full rounded-full transition-colors duration-500",
                        med.status === 'CRITICAL' ? "bg-error shadow-[0_0_10px_rgba(239,68,68,0.5)]" :
                        med.status === 'LOW' ? "bg-amber-400" :
                        med.status === 'EXPIRED' ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" :
                        "bg-secondary"
                      )}
                    />
                  </div>
                </div>

                {/* Expiry Info */}
                {earliestExpiry && (
                  <div className={cn(
                    "p-3 rounded-lg text-xs font-medium flex items-center gap-2",
                    isExp ? "bg-red-50 text-red-700 border border-red-200" :
                    isWarning ? "bg-amber-50 text-amber-700 border border-amber-200" :
                    "bg-blue-50 text-blue-700 border border-blue-200"
                  )}>
                    {isExp && <AlertCircle size={12} />}
                    {isWarning && <AlertCircle size={12} />}
                    {!isExp && !isWarning && <CheckCircle2 size={12} />}
                    <span>
                      {isExp ? 'EXPIRED' : isWarning ? `Expires in ${daysUntilExpiry} days` : `Expires ${formatExpiryDate(earliestExpiry)}`}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                    <Wifi size={12} />
                    SYNC: LIVE
                  </div>
                  <button onClick={() => setSelectedMedicine(med.id)} className="text-slate-400 hover:text-primary text-xs font-bold uppercase transition-colors">
                    View Details
                  </button>
                </div>
                      </motion.div>
                    );
                  })}
              </div>
            </motion.section>
          ))}
        </AnimatePresence>
      </div>

      {/* Medicine Details Modal */}
      <MedicineDetailsModal
        medicine={selectedMedicine ? medicines.find(m => m.id === selectedMedicine) || null : null}
        onClose={() => setSelectedMedicine(null)}
      />

      {/* Shelf Details Modal */}
      <ShelfDetailsModal
        shelfId={selectedShelf}
        medicines={medicines}
        onClose={() => setSelectedShelf(null)}
        onMedicineClick={(medicineId) => setSelectedMedicine(medicineId)}
      />
    </div>
  );
}
