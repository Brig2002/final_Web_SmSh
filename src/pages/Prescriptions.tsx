import { useApp } from '../store/AppContext';
import { 
  FileText, 
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
  AlertCircle,
  PencilLine,
  Check
} from 'lucide-react';
import { cn } from '../lib/utils';
import React, { useState } from 'react';
import { Prescription, PrescriptionStatus } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export default function Prescriptions() {
  const { prescriptions, user, medicines, createPrescription, updatePrescription, dispensePrescription } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDispenseModal, setShowDispenseModal] = useState<Prescription | null>(null);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);

  // New Prescription Form State
  const [formData, setFormData] = useState({
    patientName: '',
    medicineAllocations: medicines[0]?.id ? [{ medicineId: medicines[0].id, quantity: 1 }] : [],
  });

  const getMedicineName = (medicineId: string) => medicines.find(medicine => medicine.id === medicineId)?.name || 'Unknown Medicine';

  const getMedicineAllocations = (prescription: Prescription) => {
    if (prescription.medicineAllocations?.length) return prescription.medicineAllocations;
    return [{ medicineId: prescription.medicineId, medicineName: prescription.medicineName, quantity: prescription.quantity }];
  };

  const getPrescriptionTotalQuantity = (prescription: Prescription) => {
    return getMedicineAllocations(prescription).reduce((sum, allocation) => sum + allocation.quantity, 0);
  };

  const getPrescriptionMedicineSummary = (prescription: Prescription) => {
    return getMedicineAllocations(prescription).map(allocation => `${allocation.medicineName} × ${allocation.quantity}`);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedMedicines = formData.medicineAllocations
      .map(allocation => ({
        medicineId: allocation.medicineId,
        medicineName: getMedicineName(allocation.medicineId),
        quantity: Math.max(1, allocation.quantity || 1),
      }))
      .filter(allocation => allocation.medicineId);

    const payload = {
      patientName: formData.patientName,
      medicineId: selectedMedicines[0]?.medicineId || '',
      medicineIds: selectedMedicines.map(m => m.medicineId),
      medicineName: selectedMedicines.map(m => `${m.medicineName} × ${m.quantity}`).join(', '),
      medicineNames: selectedMedicines.map(m => m.medicineName),
      medicineAllocations: selectedMedicines,
      quantity: selectedMedicines.reduce((sum, m) => sum + m.quantity, 0),
    };

    if (editingPrescription) {
      updatePrescription(editingPrescription.id, payload);
      setEditingPrescription(null);
      setShowCreateModal(false);
    } else {
      createPrescription(payload);
      setShowCreateModal(false);
    }
    setFormData({ patientName: '', medicineAllocations: medicines[0]?.id ? [{ medicineId: medicines[0].id, quantity: 1 }] : [] });
  };

  const handleEdit = (prescription: Prescription) => {
    setEditingPrescription(prescription);
    setFormData({
      patientName: prescription.patientName,
      medicineAllocations: getMedicineAllocations(prescription).map(allocation => ({
        medicineId: allocation.medicineId,
        quantity: allocation.quantity,
      })),
    });
  };

  const toggleMedicine = (medicineId: string) => {
    setFormData(prev => ({
      ...prev,
      medicineAllocations: prev.medicineAllocations.some(allocation => allocation.medicineId === medicineId)
        ? prev.medicineAllocations.filter(allocation => allocation.medicineId !== medicineId)
        : [...prev.medicineAllocations, { medicineId, quantity: 1 }],
    }));
  };

  const updateAllocationQuantity = (medicineId: string, quantity: number) => {
    setFormData(prev => ({
      ...prev,
      medicineAllocations: prev.medicineAllocations.map(allocation => (
        allocation.medicineId === medicineId
          ? { ...allocation, quantity: Math.max(1, quantity || 1) }
          : allocation
      )),
    }));
  };

  const getPrescriptionMedicineNames = (prescription: Prescription) => {
    return getPrescriptionMedicineSummary(prescription);
  };

  const getPrescriptionMedicineCount = (prescription: Prescription) => {
    return getPrescriptionMedicineNames(prescription).length;
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

  const getStatusLabel = (status: PrescriptionStatus) => {
    switch (status) {
      case 'PENDING': return 'Pending Review';
      case 'PROCESSING': return 'Being Prepared';
      case 'READY': return 'Ready to Dispense';
      case 'FULFILLED': return 'Dispensed';
      case 'REVIEW': return 'Needs Review';
      default: return status;
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
            onClick={() => {
              setEditingPrescription(null);
              setFormData({ patientName: '', medicineAllocations: medicines[0]?.id ? [{ medicineId: medicines[0].id, quantity: 1 }] : [] });
              setShowCreateModal(true);
            }}
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

        <div className="px-8 py-4 border-b border-slate-50 bg-slate-50/40 flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-400">
          <span>Status guide:</span>
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary">Pending Review</span>
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700">Being Prepared</span>
          <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary">Ready to Dispense</span>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500">Dispensed</span>
          <span className="px-3 py-1 rounded-full bg-error/10 text-error">Needs Review</span>
        </div>

        <div className="overflow-x-auto text-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <th className="px-8 py-4">Patient Case</th>
                <th className="px-8 py-4">Clinical Order</th>
                <th className="px-8 py-4">Allocated Quantity</th>
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
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap gap-2">
                        {getPrescriptionMedicineSummary(p).map((medicineSummary) => (
                          <span key={medicineSummary} className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                            {medicineSummary}
                          </span>
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {getPrescriptionMedicineCount(p)} medicine{getPrescriptionMedicineCount(p) === 1 ? '' : 's'} prescribed
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Ref: #{p.id.toUpperCase()}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-mono font-medium text-slate-500 tracking-tight">
                    {getPrescriptionTotalQuantity(p)} Unit(s)
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border",
                      getStatusColor(p.status)
                    )}>
                      {getStatusLabel(p.status)}
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
                    ) : user?.role === 'DOCTOR' ? (
                      <button
                        onClick={() => handleEdit(p)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-bold text-xs hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
                      >
                        <PencilLine size={14} />
                        Edit
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEdit(p)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-bold text-xs hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
                      >
                        <PencilLine size={14} />
                        Edit
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

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(showCreateModal || editingPrescription) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowCreateModal(false);
                setEditingPrescription(null);
              }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-full sm:max-w-lg bg-white rounded-3xl shadow-2xl p-5 sm:p-8 max-h-[90vh] overflow-y-auto overflow-x-hidden"
            >
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <FilePlus size={24} />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold">
                    {editingPrescription ? 'Edit Prescription' : 'New Prescription'}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {editingPrescription ? 'Update the patient and medication details.' : 'Enter patient and medication details.'}
                  </p>
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

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Select Medicines and Allocate Quantity</label>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                      {medicines.map(medicine => {
                        const allocation = formData.medicineAllocations.find(entry => entry.medicineId === medicine.id);
                        const selected = Boolean(allocation);

                        return (
                          <div
                            key={medicine.id}
                            className={cn(
                              "rounded-2xl border p-4 transition-all",
                              selected
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-white"
                            )}
                          >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                              <button
                                type="button"
                                onClick={() => toggleMedicine(medicine.id)}
                                className={cn(
                                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                                  selected ? "border-primary bg-primary text-white" : "border-slate-300 bg-white"
                                )}
                              >
                                {selected && <Check size={12} />}
                              </button>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="font-bold text-slate-900 text-sm break-words">{medicine.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest break-words">SKU: {medicine.sku}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => toggleMedicine(medicine.id)}
                                      className={cn(
                                        "text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full transition-colors",
                                        selected ? "bg-primary text-white" : "bg-white text-slate-400 border border-slate-200"
                                      )}
                                    >
                                      {selected ? 'Selected' : 'Add'}
                                    </button>
                                  </div>
                                </div>

                                {selected && allocation && (
                                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Allocated quantity</label>
                                    <input
                                      required
                                      type="number"
                                      min="1"
                                      value={allocation.quantity}
                                      onChange={(e) => updateAllocationQuantity(medicine.id, parseInt(e.target.value) || 1)}
                                      className="w-full sm:w-36 px-4 py-3 bg-white border-2 border-slate-100 rounded-xl focus:outline-none focus:border-primary transition-all font-bold text-sm h-[48px]"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Selected Medicines ({formData.medicineAllocations.length})
                  </p>
                  <p className="text-sm font-medium text-slate-700">
                    {formData.medicineAllocations.length > 0
                      ? formData.medicineAllocations.map(allocation => `${getMedicineName(allocation.medicineId)} × ${allocation.quantity}`).join(', ')
                      : 'No medicine selected'}
                  </p>
                  <p className="mt-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Total units: {formData.medicineAllocations.reduce((sum, allocation) => sum + allocation.quantity, 0)}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingPrescription(null);
                    }}
                    className="w-full sm:flex-1 px-6 py-4 bg-slate-100 text-slate-500 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                  >
                    Discard
                  </button>
                  <button 
                    type="submit"
                    className="w-full sm:flex-[2] px-6 py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    {editingPrescription ? 'Save Changes' : 'Confirm Order'}
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
                      <span className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Medicines</span>
                      <span className="font-bold text-primary underline underline-offset-4 decoration-primary/20 text-right max-w-[220px]">
                        {getPrescriptionMedicineSummary(showDispenseModal).join(', ')}
                      </span>
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
