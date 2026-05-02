import { X, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Medicine } from '../types';
import { useApp } from '../store/AppContext';
import { 
  formatExpiryDate, 
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

  const daysUntil = getDaysUntilExpiry(medicine.expiryDate);
  const isExp = isExpired(medicine.expiryDate);
  const isWarning = !isExp && isExpiryWarning(medicine.expiryDate, 14);
  const expiryStatus = getExpiryStatus(medicine.expiryDate);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
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
              <p className="font-display text-3xl font-bold text-slate-900 mt-2">{medicine.quantity}</p>
              <p className="text-xs text-slate-500 mt-1">of {medicine.capacity} capacity</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Location</p>
              <p className="font-display text-2xl font-bold text-slate-900 mt-2">{medicine.shelfId}</p>
              <p className="text-xs text-slate-500 mt-1">Shelf ID</p>
            </div>
          </div>

          {/* Batch Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Batch ID</p>
              <p className="font-mono text-lg font-bold text-slate-900 mt-2">{medicine.batchId}</p>
            </div>
            <div className={cn(
              "p-4 rounded-xl border",
              isExp ? "border-red-200 bg-red-50" :
              isWarning ? "border-amber-200 bg-amber-50" :
              "border-secondary/20 bg-secondary/5"
            )}>
              <p className={cn(
                "text-xs font-bold uppercase tracking-widest",
                isExp ? "text-red-600" :
                isWarning ? "text-amber-700" :
                "text-secondary"
              )}>
                Expiry Date
              </p>
              <p className="font-display text-2xl font-bold text-slate-900 mt-2">
                {formatExpiryDate(medicine.expiryDate)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {daysUntil < 0
                  ? `${Math.abs(daysUntil)} days ago`
                  : `${daysUntil} days left`}
              </p>
            </div>
            <div className={cn(
              "p-4 rounded-xl border",
              medicine.status === 'EXPIRED' ? "border-red-200 bg-red-50" :
              medicine.status === 'LOW' ? "border-amber-200 bg-amber-50" :
              "border-secondary/20 bg-secondary/5"
            )}>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</p>
              <p className={cn(
                "font-display text-2xl font-bold mt-2",
                medicine.status === 'EXPIRED' ? "text-red-700" :
                medicine.status === 'LOW' ? "text-amber-700" :
                "text-secondary"
              )}>
                {medicine.status}
              </p>
              <p className="text-xs text-slate-500 mt-1">Current inventory status</p>
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
              <p className="text-xs text-slate-600">Expiry state: {expiryStatus}</p>
            </div>
          </div>

          {/* Batch Details Card */}
          <div>
            <h3 className="font-display text-xl font-bold text-slate-900 mb-4">Batch Details</h3>
            <div className={cn(
              "rounded-2xl border p-6 shadow-sm",
              isExp ? "bg-red-50 border-red-200" :
              isWarning ? "bg-amber-50 border-amber-200" :
              "bg-secondary/5 border-secondary/10"
            )}>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Batch ID</p>
                  <p className="mt-1 font-mono text-sm font-bold text-slate-700">{medicine.batchId}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Units</p>
                  <p className="mt-1 font-bold text-slate-900">{medicine.quantity} units</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Expiry</p>
                  <p className="mt-1 font-medium text-slate-700">{formatExpiryDate(medicine.expiryDate)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Remaining</p>
                  <p className={cn(
                    "mt-1 font-bold",
                    isExp ? "text-red-700" :
                    isWarning ? "text-amber-700" :
                    "text-secondary"
                  )}>
                    {daysUntil < 0 ? `${Math.abs(daysUntil)} days ago` : `${daysUntil} days left`}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</p>
                  <div className={cn(
                    "flex items-center gap-2 w-fit px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mt-1",
                    isExp ? "bg-red-100 text-red-700" :
                    isWarning ? "bg-amber-100 text-amber-700" :
                    "bg-secondary/10 text-secondary"
                  )}>
                    {isExp && <AlertCircle size={12} />}
                    {isWarning && !isExp && <Clock size={12} />}
                    {!isExp && !isWarning && <CheckCircle2 size={12} />}
                    {expiryStatus}
                  </div>
                </div>
              </div>

              {medicine.manufacturingDate && (
                <div className="mt-4 pt-4 border-t border-slate-200/50">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Manufacturing Date</p>
                  <p className="mt-1 text-sm text-slate-700">{formatExpiryDate(medicine.manufacturingDate)}</p>
                </div>
              )}
            </div>
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
