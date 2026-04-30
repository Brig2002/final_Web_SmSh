import { X, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { Medicine } from '../types';
import { 
  formatExpiryDate, 
  getTotalQuantity, 
  getDaysUntilExpiry, 
  isExpired, 
  isExpiryWarning,
  getEarliestExpiryDate,
  getExpiryStatus
} from '../lib/utils';
import { cn } from '../lib/utils';

interface ShelfDetailsModalProps {
  shelfId: string | null;
  medicines: Medicine[];
  onClose: () => void;
  onMedicineClick?: (medicineId: string) => void;
}

export default function ShelfDetailsModal({ shelfId, medicines, onClose, onMedicineClick }: ShelfDetailsModalProps) {
  if (!shelfId) return null;

  const shelfMedicines = medicines.filter(m => m.shelfId === shelfId);

  if (shelfMedicines.length === 0) {
    return null;
  }

  const totalShelfQuantity = shelfMedicines.reduce((sum, med) => sum + getTotalQuantity(med.batches), 0);
  const totalShelfCapacity = shelfMedicines.reduce((sum, med) => sum + med.capacity, 0);
  const expiredCount = shelfMedicines.filter(med => med.status === 'EXPIRED').length;
  const expiringCount = shelfMedicines.filter(med => {
    const earliestExpiry = getEarliestExpiryDate(med.batches);
    return earliestExpiry && isExpiryWarning(earliestExpiry, 14) && !isExpired(earliestExpiry);
  }).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-8 border-b border-slate-200 bg-white rounded-t-3xl">
          <div>
            <h2 className="font-display text-3xl font-bold text-slate-900">{shelfId}</h2>
            <p className="text-sm text-slate-500 mt-1">Shelf Overview & Medicines</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Shelf Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Medicines Stored</p>
              <p className="font-display text-3xl font-bold text-slate-900 mt-2">{shelfMedicines.length}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Quantity</p>
              <p className="font-display text-3xl font-bold text-slate-900 mt-2">{totalShelfQuantity}</p>
              <p className="text-xs text-slate-500 mt-1">of {totalShelfCapacity} capacity</p>
            </div>
            <div className="p-4 bg-red-50 rounded-xl border border-red-200">
              <p className="text-xs font-bold text-red-600 uppercase tracking-widest">Expired</p>
              <p className="font-display text-3xl font-bold text-red-700 mt-2">{expiredCount}</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">Expiring Soon</p>
              <p className="font-display text-3xl font-bold text-amber-700 mt-2">{expiringCount}</p>
            </div>
          </div>

          {/* Medicines Table */}
          <div>
            <h3 className="font-display text-xl font-bold text-slate-900 mb-4">Medicines on this Shelf</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-200 bg-slate-50">
                    <th className="text-left p-4 font-bold text-slate-600 uppercase tracking-widest text-xs">Medicine Name</th>
                    <th className="text-left p-4 font-bold text-slate-600 uppercase tracking-widest text-xs">SKU</th>
                    <th className="text-left p-4 font-bold text-slate-600 uppercase tracking-widest text-xs">Quantity</th>
                    <th className="text-left p-4 font-bold text-slate-600 uppercase tracking-widest text-xs">Earliest Expiry</th>
                    <th className="text-left p-4 font-bold text-slate-600 uppercase tracking-widest text-xs">Days Until</th>
                    <th className="text-left p-4 font-bold text-slate-600 uppercase tracking-widest text-xs">Status</th>
                    <th className="text-left p-4 font-bold text-slate-600 uppercase tracking-widest text-xs">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {shelfMedicines.map((med) => {
                    const totalQty = getTotalQuantity(med.batches);
                    const earliestExpiry = getEarliestExpiryDate(med.batches);
                    const daysUntil = earliestExpiry ? getDaysUntilExpiry(earliestExpiry) : null;
                    const expiryStatus = earliestExpiry ? getExpiryStatus(earliestExpiry) : 'OK';
                    const isExpiredMed = isExpired(earliestExpiry || '');
                    const isWarning = earliestExpiry ? isExpiryWarning(earliestExpiry, 14) : false;

                    return (
                      <tr
                        key={med.id}
                        className={cn(
                          "border-b border-slate-100 hover:bg-slate-50 transition-colors",
                          isExpiredMed ? "bg-red-50" :
                          isWarning ? "bg-amber-50" :
                          ""
                        )}
                      >
                        <td className="p-4">
                          <div>
                            <p className="font-bold text-slate-900">{med.name}</p>
                            <p className="text-xs text-slate-500">{med.description}</p>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-xs font-bold text-slate-600">{med.sku}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-slate-900">{totalQty}</span>
                            <span className="text-xs text-slate-500">/ {med.capacity}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          {earliestExpiry ? (
                            <p className="text-slate-700 font-medium">{formatExpiryDate(earliestExpiry)}</p>
                          ) : (
                            <p className="text-slate-500 italic">No batches</p>
                          )}
                        </td>
                        <td className="p-4">
                          {daysUntil !== null ? (
                            <p className={cn(
                              "font-bold",
                              isExpiredMed ? "text-red-600" :
                              isWarning ? "text-amber-600" :
                              "text-secondary"
                            )}>
                              {daysUntil < 0 ? `${Math.abs(daysUntil)} days ago` : `${daysUntil} days`}
                            </p>
                          ) : (
                            <p className="text-slate-500">-</p>
                          )}
                        </td>
                        <td className="p-4">
                          <div className={cn(
                            "flex items-center gap-2 w-fit px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider",
                            isExpiredMed ? "bg-red-100 text-red-700" :
                            isWarning ? "bg-amber-100 text-amber-700" :
                            med.status === 'CRITICAL' ? "bg-error/10 text-error" :
                            med.status === 'LOW' ? "bg-amber-100 text-amber-700" :
                            "bg-secondary/10 text-secondary"
                          )}>
                            {isExpiredMed && <AlertCircle size={12} />}
                            {isWarning && <Clock size={12} />}
                            {!isExpiredMed && !isWarning && isWarning === false && <CheckCircle2 size={12} />}
                            {isExpiredMed ? 'EXPIRED' : isWarning ? 'EXPIRING' : med.status}
                          </div>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => {
                              onMedicineClick?.(med.id);
                              onClose();
                            }}
                            className="text-xs font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-widest"
                          >
                            View →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
            <div className="flex items-start gap-3">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 w-fit">
                <AlertCircle size={12} />
                EXPIRED
              </div>
              <p className="text-xs text-slate-600">Medicine batch has passed its expiry date</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 w-fit">
                <Clock size={12} />
                EXPIRING
              </div>
              <p className="text-xs text-slate-600">Medicine expires within 14 days</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-secondary/10 text-secondary w-fit">
                <CheckCircle2 size={12} />
                OK
              </div>
              <p className="text-xs text-slate-600">Medicine is in good condition</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
