import { X, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Medicine } from '../types';
import { useApp } from '../store/AppContext';
import { 
  formatExpiryDate, 
  getTotalQuantity, 
  getDaysUntilExpiry, 
  isExpired, 
  isExpiryWarning,
  getExpiryStatus
} from '../lib/utils';
import { cn } from '../lib/utils';

interface MedicineDetailsModalProps {
  medicine: Medicine | null;
  onClose: () => void;
}

export default function MedicineDetailsModal({ medicine, onClose }: MedicineDetailsModalProps) {
  const { recordInventoryRemoval, user } = useApp();

  if (!medicine) return null;

  const totalQty = getTotalQuantity(medicine.batches);
  const sortedBatches = [...medicine.batches].sort((a, b) => 
    new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-8 border-b border-slate-200 bg-white rounded-t-3xl">
          <div>
            <h2 className="font-display text-3xl font-bold text-slate-900">{medicine.name}</h2>
            <p className="text-sm text-slate-500 mt-1">SKU: {medicine.sku}</p>
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
          {/* Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Quantity</p>
              <p className="font-display text-3xl font-bold text-slate-900 mt-2">{totalQty}</p>
              <p className="text-xs text-slate-500 mt-1">of {medicine.capacity} capacity</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Location</p>
              <p className="font-display text-2xl font-bold text-slate-900 mt-2">{medicine.shelfId}</p>
              <p className="text-xs text-slate-500 mt-1">Shelf ID</p>
            </div>
          </div>

          {/* Status Badge */}
          <div className={cn(
            "flex items-center gap-3 p-4 rounded-xl",
            medicine.status === 'CRITICAL' ? "bg-error/10" :
            medicine.status === 'LOW' ? "bg-amber-100" :
            medicine.status === 'EXPIRED' ? "bg-red-100" :
            "bg-secondary/10"
          )}>
            {medicine.status === 'CRITICAL' && <AlertCircle size={20} className="text-error" />}
            {medicine.status === 'LOW' && <AlertCircle size={20} className="text-amber-600" />}
            {medicine.status === 'EXPIRED' && <AlertCircle size={20} className="text-red-600" />}
            {medicine.status === 'NORMAL' && <CheckCircle2 size={20} className="text-secondary" />}
            <div>
              <p className={cn(
                "font-bold uppercase tracking-widest text-sm",
                medicine.status === 'CRITICAL' ? "text-error" :
                medicine.status === 'LOW' ? "text-amber-700" :
                medicine.status === 'EXPIRED' ? "text-red-700" :
                "text-secondary"
              )}>
                {medicine.status}
              </p>
              <p className="text-xs text-slate-600">Current inventory status</p>
            </div>
          </div>

          {/* Batches Table */}
          <div>
            <h3 className="font-display text-xl font-bold text-slate-900 mb-4">Batch Details</h3>
            {medicine.batches.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl">
                <p className="text-slate-500">No batches in inventory</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left p-4 font-bold text-slate-600 uppercase tracking-widest text-xs">Batch ID</th>
                      <th className="text-left p-4 font-bold text-slate-600 uppercase tracking-widest text-xs">Quantity</th>
                      <th className="text-left p-4 font-bold text-slate-600 uppercase tracking-widest text-xs">Expiry Date</th>
                      <th className="text-left p-4 font-bold text-slate-600 uppercase tracking-widest text-xs">Days Until</th>
                      <th className="text-left p-4 font-bold text-slate-600 uppercase tracking-widest text-xs">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedBatches.map((batch) => {
                      const daysUntil = getDaysUntilExpiry(batch.expiryDate);
                      const expiryStatus = getExpiryStatus(batch.expiryDate);
                      const isExpiredBatch = isExpired(batch.expiryDate);
                      const isWarning = isExpiryWarning(batch.expiryDate, 14);

                      return (
                        <tr
                          key={batch.batchId}
                          className={cn(
                            "border-b border-slate-100",
                            isExpiredBatch ? "bg-red-50" :
                            isWarning ? "bg-amber-50" :
                            "hover:bg-slate-50"
                          )}
                        >
                          <td className="p-4 font-mono text-xs font-bold text-slate-600">{batch.batchId}</td>
                          <td className="p-4 font-bold text-slate-900">{batch.quantity} units</td>
                          <td className="p-4 text-slate-700">{formatExpiryDate(batch.expiryDate)}</td>
                          <td className={cn(
                            "p-4 font-bold",
                            isExpiredBatch ? "text-red-600" :
                            isWarning ? "text-amber-600" :
                            "text-secondary"
                          )}>
                            {daysUntil < 0 ? `${Math.abs(daysUntil)} days ago` : `${daysUntil} days`}
                          </td>
                          <td className="p-4">
                            <div className={cn(
                              "flex items-center gap-2 w-fit px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider",
                              isExpiredBatch ? "bg-red-100 text-red-700" :
                              isWarning ? "bg-amber-100 text-amber-700" :
                              "bg-secondary/10 text-secondary"
                            )}>
                              {isExpiredBatch && <AlertCircle size={12} />}
                              {isWarning && <Clock size={12} />}
                              {!isExpiredBatch && !isWarning && <CheckCircle2 size={12} />}
                              {expiryStatus}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-xs text-blue-700 font-medium">
              💡 <span className="font-bold">FIFO Protocol:</span> When dispensing prescriptions, batches are allocated from earliest expiry date first to minimize waste. Expired batches cannot be dispensed.
            </p>
          </div>

          {user?.role !== 'DOCTOR' && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-amber-700">Manual removal test</p>
                <p className="text-xs text-amber-700/80 mt-1">
                  Removing stock here without a prescription will generate an unauthorized-removal alert.
                </p>
              </div>
              <button
                onClick={() => recordInventoryRemoval(medicine.id, 1, { reason: 'Manual removal from medicine modal' })}
                className="shrink-0 rounded-xl bg-amber-600 px-4 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-amber-500"
              >
                Remove 1 Unit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
