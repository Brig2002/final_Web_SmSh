import { useApp } from '../store/AppContext';
import { 
  FileText, 
  MoreVertical, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Plus,
  ArrowRight,
  User,
  Heart,
  FilePlus,
  AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import React, { useState } from 'react';
import { Prescription, PrescriptionStatus } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export default function Prescriptions() {
  const { prescriptions, user, medicines, createPrescription, dispensePrescription } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDispenseModal, setShowDispenseModal] = useState<Prescription | null>(null);

  // New Prescription Form State
  const [formData, setFormData] = useState({
    patientName: '',
    medicineId: medicines[0]?.id || '',
    quantity: 1,
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const med = medicines.find(m => m.id === formData.medicineId);
    createPrescription({
      patientName: formData.patientName,
      medicineId: formData.medicineId,
      medicineName: med?.name || 'Unknown',
      quantity: formData.quantity,
    });
    setShowCreateModal(false);
    setFormData({ patientName: '', medicineId: medicines[0]?.id || '', quantity: 1 });
  };

  const getStatusColor = (status: PrescriptionStatus) => {
    switch (status) {
      case 'READY': return "bg-secondary/10 text-secondary border-secondary/20";
      case 'PROCESSING': return "bg-amber-100 text-amber-700 border-amber-200";
      case 'FULFILLED': return "bg-slate-100 text-slate-500 border-slate-200";
      case 'PENDING': return "bg-primary/10 text-primary border-primary/20";
      case 'REVIEW': return "bg-error/10 text-error border-error/20";
      default: return "bg-slate-100 text-slate-500";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="font-display text-4xl font-bold text-slate-900 mb-2">
            {user?.role === 'DOCTOR' ? 'Prescription Management' : 'Dispensing Queue'}
          </h2>
          <p className="text-lg text-slate-500 font-medium">Manage and process patient clinical orders.</p>
        </div>
        {user?.role === 'DOCTOR' && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-primary text-white h-12 px-6 rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
          >
            <Plus size={20} />
            New Prescription
          </button>
        )}
      </header>

      {/* Main Table Interface */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <header className="px-8 py-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative flex-1 max-w-sm w-full group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary" />
            <input 
              type="text" 
              placeholder="Filter by patient..."
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:border-primary transition-all"
            />
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest px-4 py-2 hover:bg-slate-50 rounded-xl transition-colors">
              <Filter size={14} />
              Filter
            </button>
          </div>
        </header>

        <div className="overflow-x-auto text-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <th className="px-8 py-4">Patient Case</th>
                <th className="px-8 py-4">Clinical Order</th>
                <th className="px-8 py-4">Volume</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {prescriptions.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-bold">
                        {p.patientName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{p.patientName}</p>
                        {user?.role === 'PHARMACIST' && (
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">MD: {p.doctorName}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-primary">{p.medicineName}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Ref: #{p.id.toUpperCase()}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-mono font-medium text-slate-500 tracking-tight">
                    {p.quantity} Unit(s)
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border",
                      getStatusColor(p.status)
                    )}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    {user?.role === 'PHARMACIST' && p.status !== 'FULFILLED' ? (
                      <button 
                        onClick={() => setShowDispenseModal(p)}
                        className="bg-primary px-4 py-2 rounded-lg text-white font-bold text-xs hover:bg-primary-container transition-colors shadow-md shadow-primary/10"
                      >
                        Dispense
                      </button>
                    ) : (
                      <button className="p-2 text-slate-300 hover:text-slate-600 transition-opacity opacity-0 group-hover:opacity-100">
                        <MoreVertical size={20} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {prescriptions.length === 0 && (
            <div className="p-20 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                <FileText size={32} />
              </div>
              <p className="font-bold text-slate-400">No active prescriptions in queue</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <FilePlus size={24} />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold">New Prescription</h3>
                  <p className="text-sm text-slate-500">Enter patient and medication details.</p>
                </div>
              </div>

              <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Patient Identity</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary" size={18} />
                    <input 
                      required
                      value={formData.patientName}
                      onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                      type="text" 
                      placeholder="Enter legal name"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Select Medication</label>
                    <select 
                      value={formData.medicineId}
                      onChange={(e) => setFormData({...formData, medicineId: e.target.value})}
                      className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all font-bold text-sm h-[54px]"
                    >
                      {medicines.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Volume/Quantity</label>
                    <input 
                      required
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
                      className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all font-bold text-sm h-[54px]"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-6 py-4 bg-slate-100 text-slate-500 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                  >
                    Discard
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] px-6 py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Confirm Order
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dispense Modal */}
      <AnimatePresence>
        {showDispenseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowDispenseModal(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold">Confirm Dispense</h3>
                  <p className="text-sm text-slate-500">Verify medication before authorization.</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="p-4 bg-slate-50 rounded-2xl space-y-3 border border-slate-100">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Patient</span>
                    <span className="font-bold text-slate-900">{showDispenseModal.patientName}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Medication</span>
                    <span className="font-bold text-primary underline underline-offset-4 decoration-primary/20">{showDispenseModal.medicineName}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Pharmacy Ref</span>
                    <span className="font-mono text-xs font-bold text-slate-600">#{showDispenseModal.id.toUpperCase()}</span>
                  </div>
                </div>
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3 text-amber-800">
                  <AlertCircle size={20} className="shrink-0" />
                  <p className="text-xs font-bold leading-relaxed">
                    By clicking confirm, you certify that the physical inventory removal matches this clinical record.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDispenseModal(null)}
                  className="flex-1 px-6 py-4 bg-slate-50 text-slate-400 rounded-xl font-bold hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    dispensePrescription(showDispenseModal.id);
                    setShowDispenseModal(null);
                  }}
                  className="flex-[2] px-6 py-4 bg-secondary text-white rounded-xl font-bold shadow-lg shadow-secondary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Confirm Dispensing
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
