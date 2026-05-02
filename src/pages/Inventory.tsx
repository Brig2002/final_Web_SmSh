import { useApp } from '../store/AppContext';
import { 
  Wifi, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  Clock,
  Filter,
  Package,
  MoreVertical
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { 
  formatExpiryDate, 
  getDaysUntilExpiry,
  isExpired,
  isExpiryWarning,
  getExpiryStatus
} from '../lib/utils';
import MedicineDetailsModal from '../components/MedicineDetailsModal';

export default function Inventory() {
  const { medicines, user } = useApp();
  const [selectedMedicine, setSelectedMedicine] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'expiring' | 'expired'>('all');
  const [sortType, setSortType] = useState<'name' | 'expiry' | 'quantity'>('name');

  // Filter medicines
  const filteredMedicines = medicines.filter(med => {
    if (filterType === 'expired') {
      return isExpired(med.expiryDate);
    }
    if (filterType === 'expiring') {
      return !isExpired(med.expiryDate) && isExpiryWarning(med.expiryDate, 14);
    }
    return true;
  });

  // Sort medicines
  const sortedMedicines = [...filteredMedicines].sort((a, b) => {
    if (sortType === 'name') {
      return a.name.localeCompare(b.name);
    }
    if (sortType === 'expiry') {
      return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
    }
    if (sortType === 'quantity') {
      return b.quantity - a.quantity;
    }
    return 0;
  });

  // Group medicines by shelf
  const medicinesByShelf = new Map<string, typeof sortedMedicines>();
  sortedMedicines.forEach(med => {
    const shelf = med.shelfId;
    if (!medicinesByShelf.has(shelf)) {
      medicinesByShelf.set(shelf, []);
    }
    medicinesByShelf.get(shelf)!.push(med);
  });

  const sortedShelves = Array.from(medicinesByShelf.keys()).sort();

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
        <h3 className="font-display text-xl font-bold text-slate-900">Active Shelf Monitors ({sortedShelves.length})</h3>
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

      {/* Shelves View - Organized by Location */}
      <div className="space-y-8">
        <AnimatePresence mode="popLayout">
          {sortedShelves.map((shelfId) => {
            const medicinesOnShelf = medicinesByShelf.get(shelfId) || [];
            
            // Sort medicines within shelf by expiry status
            const sortedMedicinesOnShelf = [...medicinesOnShelf].sort((a, b) => {
              const aIsExpired = isExpired(a.expiryDate);
              const bIsExpired = isExpired(b.expiryDate);
              const aIsWarning = !aIsExpired && isExpiryWarning(a.expiryDate, 14);
              const bIsWarning = !bIsExpired && isExpiryWarning(b.expiryDate, 14);
              
              if (aIsExpired && !bIsExpired) return -1;
              if (!aIsExpired && bIsExpired) return 1;
              if (aIsWarning && !bIsWarning) return -1;
              if (!aIsWarning && bIsWarning) return 1;
              return a.name.localeCompare(b.name);
            });
            
            // Count expired and expiring
            const expiredCount = sortedMedicinesOnShelf.filter(med => isExpired(med.expiryDate)).length;
            const expiringCount = sortedMedicinesOnShelf.filter(med => !isExpired(med.expiryDate) && isExpiryWarning(med.expiryDate, 14)).length;

            return (
              <motion.div
                layout
                key={shelfId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-4"
              >
                {/* Shelf Header */}
                <div className={cn(
                  "p-4 rounded-2xl border flex items-center justify-between",
                  expiredCount > 0 ? "bg-red-50 border-red-200" :
                  expiringCount > 0 ? "bg-amber-50 border-amber-200" :
                  "bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200"
                )}>
                  <div>
                    <h3 className={cn(
                      "font-mono text-sm font-bold uppercase tracking-widest",
                      expiredCount > 0 ? "text-red-700" :
                      expiringCount > 0 ? "text-amber-700" :
                      "text-slate-600"
                    )}>{shelfId}</h3>
                    <p className={cn(
                      "text-xs mt-1",
                      expiredCount > 0 ? "text-red-600" :
                      expiringCount > 0 ? "text-amber-600" :
                      "text-slate-500"
                    )}>
                      {medicinesOnShelf.length} medicine{medicinesOnShelf.length !== 1 ? 's' : ''} in storage
                      {expiredCount > 0 && (
                        <span className="ml-2 font-bold">• {expiredCount} EXPIRED</span>
                      )}
                      {expiringCount > 0 && (
                        <span className="ml-2 font-bold">• {expiringCount} EXPIRING</span>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Package size={20} className={cn(
                      expiredCount > 0 ? "text-red-500" :
                      expiringCount > 0 ? "text-amber-500" :
                      "text-slate-400"
                    )} />
                    {(expiredCount > 0 || expiringCount > 0) && (
                      <AlertCircle size={16} className={cn(
                        expiredCount > 0 ? "text-red-500" : "text-amber-500"
                      )} />
                    )}
                  </div>
                </div>

                {/* Medicines on this shelf */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ml-4">
                  {sortedMedicinesOnShelf.map((med) => {
                    const isExp = isExpired(med.expiryDate);
                    const isWarning = !isExp && isExpiryWarning(med.expiryDate, 14);
                    const daysUntilExpiry = getDaysUntilExpiry(med.expiryDate);

                    return (
                      <motion.div
                        layout
                        key={med.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onClick={() => setSelectedMedicine(med.id)}
                        className={cn(
                          "group bg-white rounded-2xl p-5 border-2 shadow-sm relative overflow-hidden flex flex-col gap-5 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer",
                          med.status === 'CRITICAL' ? "border-error/20" :
                          med.status === 'LOW' ? "border-amber-200" :
                          med.status === 'EXPIRED' ? "border-red-200" :
                          "border-slate-100"
                        )}
                      >
                        <div className={cn(
                          "absolute top-0 left-0 right-0 h-1",
                          med.status === 'CRITICAL' ? "bg-error" :
                          med.status === 'LOW' ? "bg-amber-400" :
                          med.status === 'EXPIRED' ? "bg-red-500" :
                          "bg-secondary"
                        )} />

                        <div className="flex justify-between items-start">
                          <div className="space-y-1 flex-1">
                            <h4 className="font-display text-lg font-bold text-slate-800">{med.name}</h4>
                            <div className={cn(
                              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit",
                              med.status === 'CRITICAL' ? "bg-error/10 text-error" :
                              med.status === 'LOW' ? "bg-amber-100 text-amber-700" :
                              med.status === 'EXPIRED' ? "bg-red-100 text-red-700" :
                              "bg-secondary/10 text-secondary"
                            )}>
                              {med.status === 'CRITICAL' && <AlertCircle size={10} />}
                              {med.status === 'LOW' && <Info size={10} />}
                              {med.status === 'EXPIRED' && <AlertCircle size={10} />}
                              {med.status === 'NORMAL' && <CheckCircle2 size={10} />}
                              {med.status}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2.5">
                          <div className="flex justify-between items-end">
                            <span className={cn(
                              "text-base font-bold font-display",
                              med.status === 'CRITICAL' ? "text-error" : "text-slate-900"
                            )}>
                              {med.quantity} units
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase">{med.capacity} cap</span>
                          </div>
                          <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(med.quantity / med.capacity) * 100}%` }}
                              className={cn(
                                "h-full rounded-full",
                                med.status === 'CRITICAL' ? "bg-error shadow-[0_0_6px_rgba(239,68,68,0.5)]" :
                                med.status === 'LOW' ? "bg-amber-400" :
                                med.status === 'EXPIRED' ? "bg-red-500" :
                                "bg-secondary"
                              )}
                            />
                          </div>
                        </div>

                        <div className={cn(
                          "p-2.5 rounded-lg text-xs font-medium flex items-center gap-2",
                          isExp ? "bg-red-50 text-red-700 border border-red-200" :
                          isWarning ? "bg-amber-50 text-amber-700 border border-amber-200" :
                          "bg-blue-50 text-blue-700 border border-blue-200"
                        )}>
                          {isExp && <AlertCircle size={11} />}
                          {isWarning && <AlertCircle size={11} />}
                          {!isExp && !isWarning && <CheckCircle2 size={11} />}
                          <span>
                            {isExp ? 'EXPIRED' : isWarning ? `${daysUntilExpiry}d left` : `${formatExpiryDate(med.expiryDate)}`}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                          <span className="text-[9px] font-bold text-slate-400 uppercase font-mono">{med.batchId}</span>
                          <button onClick={(e) => { e.stopPropagation(); setSelectedMedicine(med.id); }} className="ml-auto text-slate-400 hover:text-primary text-xs font-bold transition-colors">
                            View
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* All Medicines — Batch IDs */}
      <div className="mt-8">
        <h3 className="font-display text-lg font-bold text-slate-900 mb-3">All Medicines — Batch IDs</h3>
        <div className="overflow-x-auto bg-white rounded-2xl border p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left p-3 font-bold text-slate-600 uppercase tracking-widest text-xs">Medicine</th>
                <th className="text-left p-3 font-bold text-slate-600 uppercase tracking-widest text-xs">SKU</th>
                <th className="text-left p-3 font-bold text-slate-600 uppercase tracking-widest text-xs">Batch ID</th>
                <th className="text-left p-3 font-bold text-slate-600 uppercase tracking-widest text-xs">Quantity</th>
                <th className="text-left p-3 font-bold text-slate-600 uppercase tracking-widest text-xs">Expiry</th>
                <th className="text-left p-3 font-bold text-slate-600 uppercase tracking-widest text-xs">Shelf</th>
              </tr>
            </thead>
            <tbody>
              {sortedMedicines.map((med) => (
                <tr key={med.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-800">{med.name}</td>
                  <td className="p-3 font-mono text-xs text-slate-600">{med.sku}</td>
                  <td className="p-3 font-mono font-bold text-slate-700">{med.batchId}</td>
                  <td className="p-3 text-slate-700">{med.quantity} units</td>
                  <td className="p-3 text-slate-700">{formatExpiryDate(med.expiryDate)}</td>
                  <td className="p-3 text-slate-700">{med.shelfId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Medicine Details Modal */}
      <MedicineDetailsModal
        medicine={selectedMedicine ? medicines.find(m => m.id === selectedMedicine) || null : null}
        onClose={() => setSelectedMedicine(null)}
      />
    </div>
  );
} 
