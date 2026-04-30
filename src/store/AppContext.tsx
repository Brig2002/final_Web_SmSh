import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Medicine, Prescription, SystemAlert, UserRole, StockStatus, MedicineAllocation, MedicineBatch } from '../types';
import { getTotalQuantity, getEarliestExpiryDate, calculateMedicineStatus, isExpired, isExpiryWarning, getDaysUntilExpiry } from '../lib/utils';

interface AppState {
  user: User | null;
  medicines: Medicine[];
  prescriptions: Prescription[];
  alerts: SystemAlert[];
  isLoading: boolean;
}

interface AppContextType extends AppState {
  login: (role: UserRole) => void;
  logout: () => void;
  createPrescription: (data: Partial<Prescription>) => void;
  updatePrescription: (id: string, data: Partial<Prescription>) => void;
  dispensePrescription: (id: string) => void;
  recordInventoryRemoval: (medicineId: string, quantity: number, options?: { prescriptionId?: string; reason?: string }) => boolean;
  resolveAlert: (id: string) => void;
  updateInventory: (id: string, newQuantity: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_MEDICINES: Medicine[] = [
  { 
    id: '1', 
    name: 'Amoxicillin 500mg', 
    sku: 'AMX-500-CAP', 
    description: 'Capsules • 30ct bottles', 
    batches: [
      { batchId: 'BATCH-001', quantity: 8, expiryDate: '2025-10-15', manufacturingDate: '2024-10-15' },
      { batchId: 'BATCH-002', quantity: 4, expiryDate: '2026-02-20', manufacturingDate: '2024-08-20' },
    ],
    capacity: 100, 
    shelfId: 'SHF-A104', 
    status: 'CRITICAL' 
  },
  { 
    id: '2', 
    name: 'Lisinopril 10mg', 
    sku: 'LIS-010-TAB', 
    description: 'Tablets • 90ct bottles', 
    batches: [
      { batchId: 'BATCH-003', quantity: 145, expiryDate: '2026-11-30', manufacturingDate: '2024-11-30' },
    ],
    capacity: 150, 
    shelfId: 'SHF-B202', 
    status: 'NORMAL' 
  },
  { 
    id: '3', 
    name: 'Atorvastatin 20mg', 
    sku: 'ATO-020-TAB', 
    description: 'Tablets • 30ct bottles', 
    batches: [
      { batchId: 'BATCH-004', quantity: 30, expiryDate: '2026-05-12', manufacturingDate: '2024-05-12' },
      { batchId: 'BATCH-005', quantity: 15, expiryDate: '2028-05-12', manufacturingDate: '2024-05-12' },
    ],
    capacity: 200, 
    shelfId: 'SHF-C018', 
    status: 'LOW' 
  },
  { 
    id: '4', 
    name: 'Metformin 850mg', 
    sku: 'MET-850-200', 
    description: 'Tablets • 60ct bottles', 
    batches: [
      { batchId: 'BATCH-006', quantity: 88, expiryDate: '2026-02-28', manufacturingDate: '2023-02-28' },
    ],
    capacity: 120, 
    shelfId: 'SHF-A090', 
    status: 'NORMAL' 
  },
  { 
    id: '5', 
    name: 'Albuterol Inhaler', 
    sku: 'ALB-INH-085', 
    description: 'Aerosol • 8.5g', 
    batches: [
      { batchId: 'BATCH-007', quantity: 3, expiryDate: '2025-08-20', manufacturingDate: '2023-08-20' },
    ],
    capacity: 50, 
    shelfId: 'SHF-D405', 
    status: 'CRITICAL' 
  },
  { 
    id: '6', 
    name: 'Omeprazole 20mg', 
    sku: 'OME-020-CAP', 
    description: 'Capsules • 30ct bottles', 
    batches: [
      { batchId: 'BATCH-008', quantity: 110, expiryDate: '2025-01-10', manufacturingDate: '2023-01-10' },
    ],
    capacity: 150, 
    shelfId: 'SHF-B112', 
    status: 'NORMAL' 
  },
];

const INITIAL_PRESCRIPTIONS: Prescription[] = [
  { id: 'p1', patientName: 'Michael Rossi', medicineId: '1', medicineIds: ['1'], medicineName: 'Amoxicillin 500mg', medicineNames: ['Amoxicillin 500mg'], medicineAllocations: [{ medicineId: '1', medicineName: 'Amoxicillin 500mg', quantity: 1 }], quantity: 1, date: '2023-10-24', time: '09:41 AM', status: 'READY', doctorId: 'd1', doctorName: 'Dr. Sarah Jenkins' },
  { id: 'p2', patientName: 'Elena Vance', medicineId: '2', medicineIds: ['2'], medicineName: 'Lisinopril 10mg', medicineNames: ['Lisinopril 10mg'], medicineAllocations: [{ medicineId: '2', medicineName: 'Lisinopril 10mg', quantity: 1 }], quantity: 1, date: '2023-10-24', time: '09:15 AM', status: 'PROCESSING', doctorId: 'd1', doctorName: 'Dr. Sarah Jenkins' },
  { id: 'p3', patientName: 'David Wallace', medicineId: '3', medicineIds: ['3'], medicineName: 'Atorvastatin 20mg', medicineNames: ['Atorvastatin 20mg'], medicineAllocations: [{ medicineId: '3', medicineName: 'Atorvastatin 20mg', quantity: 1 }], quantity: 1, date: '2023-10-23', time: '04:30 PM', status: 'REVIEW', doctorId: 'd2', doctorName: 'Dr. Michael Scott' },
];

const INITIAL_ALERTS: SystemAlert[] = [
  { id: 'a1', type: 'UNAUTHORIZED', message: 'Unauthorized Removal Detected', details: 'Oxycodone 10mg HCL has been removed from Shelf ID: S-4B without a linked prescription ID.', timestamp: '10:42 AM Today', resolved: false, severity: 'HIGH', sku: 'RX-OXY-10-449', location: 'Zone A, S-4B' },
  { id: 'a2', type: 'LOW_STOCK', message: 'Amoxicillin 500mg Below Minimum Threshold', details: 'Current stock level (12 units) has fallen below the minimum required threshold (20 units).', timestamp: '09:15 AM Today', resolved: false, severity: 'MEDIUM', sku: 'AMX-500-CAP', location: 'SHF-A104' },
];

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>(INITIAL_MEDICINES);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(INITIAL_PRESCRIPTIONS);
  const [alerts, setAlerts] = useState<SystemAlert[]>(INITIAL_ALERTS);
  const [isLoading, setIsLoading] = useState(false);

  // Load user from storage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('pharma_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (role: UserRole) => {
    setIsLoading(true);
    setTimeout(() => {
      const newUser: User = {
        id: role.toLowerCase() + '_1',
        name: role === 'DOCTOR' ? 'Dr. Sarah Jenkins' : role === 'PHARMACIST' ? 'Ph. Alice Wong' : 'Admin User',
        role,
        email: `${role.toLowerCase()}@pharmasmart.com`,
      };
      setUser(newUser);
      localStorage.setItem('pharma_user', JSON.stringify(newUser));
      setIsLoading(false);
    }, 800);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pharma_user');
  };

  const buildAllocations = (data: Partial<Prescription>, fallback?: Prescription): MedicineAllocation[] => {
    if (data.medicineAllocations?.length) {
      return data.medicineAllocations.map(allocation => ({
        medicineId: allocation.medicineId,
        medicineName: allocation.medicineName,
        quantity: Math.max(1, allocation.quantity || 1),
      }));
    }

    if (fallback?.medicineAllocations?.length && !data.medicineId && !data.medicineName && !data.quantity) {
      return fallback.medicineAllocations.map(allocation => ({
        medicineId: allocation.medicineId,
        medicineName: allocation.medicineName,
        quantity: Math.max(1, allocation.quantity || 1),
      }));
    }

    const medicineId = data.medicineId ?? fallback?.medicineId ?? '1';
    const medicineName = data.medicineName ?? fallback?.medicineName ?? 'Unknown Medicine';
    const quantity = Math.max(1, data.quantity ?? fallback?.quantity ?? 1);

    return [{ medicineId, medicineName, quantity }];
  };

  const buildPrescriptionPayload = (data: Partial<Prescription>, fallback?: Prescription) => {
    const medicineAllocations = buildAllocations(data, fallback);
    const medicineIds = medicineAllocations.map(allocation => allocation.medicineId);
    const medicineNames = medicineAllocations.map(allocation => allocation.medicineName);
    const totalQuantity = medicineAllocations.reduce((sum, allocation) => sum + allocation.quantity, 0);

    return {
      medicineAllocations,
      medicineIds,
      medicineNames,
      medicineId: medicineIds[0],
      medicineName: medicineAllocations.map(allocation => `${allocation.medicineName} × ${allocation.quantity}`).join(', '),
      quantity: totalQuantity,
    };
  };

  const createUnauthorizedRemovalAlert = (medicine: Medicine, quantity: number, reason?: string) => {
    const alertId = `unauthorized-removal-${medicine.id}-${Date.now()}`;

    setAlerts(prev => [
      {
        id: alertId,
        type: 'UNAUTHORIZED',
        message: 'Unauthorized Removal Detected',
        details: `${medicine.name} has been removed from Shelf ID: ${medicine.shelfId} without a linked prescription ID${reason ? ` (${reason})` : ''}. Requested quantity: ${quantity} units.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        resolved: false,
        severity: 'HIGH',
        sku: medicine.sku,
        location: medicine.shelfId,
      },
      ...prev,
    ]);
  };

  const removeQuantityFromMedicine = (medicine: Medicine, quantityToRemove: number) => {
    const sortedBatches = [...medicine.batches].sort((a, b) => 
      new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
    );

    let remaining = quantityToRemove;
    const updatedBatches: MedicineBatch[] = [];

    for (const batch of sortedBatches) {
      if (remaining <= 0) {
        updatedBatches.push(batch);
        continue;
      }

      if (batch.quantity <= remaining) {
        remaining -= batch.quantity;
        continue;
      }

      updatedBatches.push({ ...batch, quantity: batch.quantity - remaining });
      remaining = 0;
    }

    if (remaining > 0) {
      return null;
    }

    return {
      batches: updatedBatches,
      status: calculateMedicineStatus(updatedBatches, medicine.capacity),
    };
  };

  const createPrescription = (data: Partial<Prescription>) => {
    if (!user) return;
    const payload = buildPrescriptionPayload(data);
    const newP: Prescription = {
      id: 'p' + (prescriptions.length + 1),
      patientName: data.patientName || 'Unknown',
      ...payload,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'PENDING',
      doctorId: user.id,
      doctorName: user.name,
    };
    setPrescriptions([newP, ...prescriptions]);
  };

  const updatePrescription = (id: string, data: Partial<Prescription>) => {
    setPrescriptions(prev => prev.map(p => {
      if (p.id !== id) return p;
      const payload = buildPrescriptionPayload(data, p);
      return {
        ...p,
        patientName: data.patientName ?? p.patientName,
        ...payload,
      };
    }));
  };

  const dispensePrescription = (id: string) => {
    const prescription = prescriptions.find(currentPrescription => currentPrescription.id === id);
    if (!prescription) return;

    const prescriptionMedicineAllocations = prescription.medicineAllocations?.length
      ? prescription.medicineAllocations
      : [{ medicineId: prescription.medicineId, medicineName: prescription.medicineName, quantity: prescription.quantity }];

    for (const allocation of prescriptionMedicineAllocations) {
      const medicine = medicines.find(currentMedicine => currentMedicine.id === allocation.medicineId);
      if (!medicine) return;

      const earliestBatch = [...medicine.batches].sort((a, b) => 
        new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
      )[0];

      if (earliestBatch && isExpired(earliestBatch.expiryDate)) {
        return;
      }

      const removed = recordInventoryRemoval(medicine.id, allocation.quantity, {
        prescriptionId: prescription.id,
        reason: `Prescription dispense ${prescription.id}`,
      });

      if (!removed) {
        return;
      }
    }

    setPrescriptions(prev => prev.map(currentPrescription => (
      currentPrescription.id === id
        ? { ...currentPrescription, status: 'FULFILLED' }
        : currentPrescription
    )));
  };

  const recordInventoryRemoval = (medicineId: string, quantity: number, options?: { prescriptionId?: string; reason?: string }) => {
    const medicine = medicines.find(currentMedicine => currentMedicine.id === medicineId);
    if (!medicine) return false;

    const isAuthorizedRemoval = Boolean(options?.prescriptionId);
    if (!isAuthorizedRemoval) {
      createUnauthorizedRemovalAlert(medicine, quantity, options?.reason);
      return false;
    }

    const result = removeQuantityFromMedicine(medicine, quantity);
    if (!result) return false;

    setMedicines(prev => prev.map(currentMedicine => (
      currentMedicine.id === medicineId
        ? { ...currentMedicine, ...result }
        : currentMedicine
    )));

    return true;
  };

  const resolveAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
  };

  const updateInventory = (id: string, newQuantity: number) => {
    setMedicines(prev => prev.map(m => {
      if (m.id === id) {
        // Add to the latest batch (or create new one)
        let batches = [...m.batches];
        if (batches.length === 0) {
          // Create default batch if none exists
          batches = [{
            batchId: `BATCH-${Date.now()}`,
            quantity: newQuantity,
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          }];
        } else {
          // Add to the latest batch
          const latestBatch = batches[batches.length - 1];
          batches = batches.map((batch, idx) => 
            idx === batches.length - 1 
              ? { ...batch, quantity: newQuantity } 
              : batch
          );
        }

        const status = calculateMedicineStatus(batches, m.capacity);
        return { ...m, batches, status };
      }
      return m;
    }));
  };

  /**
   * Generate expiry alerts for batches within warning threshold
   */
  const generateExpiryAlerts = () => {
    const newAlerts: SystemAlert[] = [];
    const now = new Date().toISOString().split('T')[0];

    medicines.forEach(medicine => {
      medicine.batches.forEach(batch => {
        const daysUntilExpiry = getDaysUntilExpiry(batch.expiryDate);
        
        // Check if expired
        if (isExpired(batch.expiryDate)) {
          const alertId = `expiry-${medicine.id}-${batch.batchId}`;
          const existingAlert = alerts.find(a => a.id === alertId);
          
          if (!existingAlert) {
            newAlerts.push({
              id: alertId,
              type: 'EXPIRY',
              message: `${medicine.name} - Batch ${batch.batchId} EXPIRED`,
              details: `Batch ${batch.batchId} of ${medicine.name} (${medicine.sku}) expired on ${batch.expiryDate}. Quantity: ${batch.quantity} units. Location: ${medicine.shelfId}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              resolved: false,
              severity: 'HIGH',
              sku: medicine.sku,
              location: medicine.shelfId,
            });
          }
        }
        // Check if expiring within 14 days
        else if (isExpiryWarning(batch.expiryDate, 14)) {
          const alertId = `expiry-warning-${medicine.id}-${batch.batchId}`;
          const existingAlert = alerts.find(a => a.id === alertId);
          
          if (!existingAlert) {
            newAlerts.push({
              id: alertId,
              type: 'EXPIRY',
              message: `${medicine.name} - Batch ${batch.batchId} Expiring Soon`,
              details: `Batch ${batch.batchId} of ${medicine.name} (${medicine.sku}) will expire in ${daysUntilExpiry} days on ${batch.expiryDate}. Quantity: ${batch.quantity} units. Location: ${medicine.shelfId}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              resolved: false,
              severity: 'MEDIUM',
              sku: medicine.sku,
              location: medicine.shelfId,
            });
          }
        }
      });
    });

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev]);
    }
  };

  // Simulation: Random stock fluctuations to show "Real-time" effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const randomIndex = Math.floor(Math.random() * medicines.length);
        const medicine = medicines[randomIndex];
        const totalQty = getTotalQuantity(medicine.batches);
        if (totalQty > 0) {
          recordInventoryRemoval(medicine.id, 1, { prescriptionId: 'SIMULATED-AUDIT', reason: 'Inventory simulation' });
        }
      }
    }, 10000); // Every 10 seconds
    return () => clearInterval(interval);
  }, [medicines]);

  // Generate expiry alerts periodically
  useEffect(() => {
    generateExpiryAlerts();
    const expiryInterval = setInterval(generateExpiryAlerts, 60000); // Check every minute
    return () => clearInterval(expiryInterval);
  }, [medicines, alerts]);

  return (
    <AppContext.Provider value={{ 
      user, medicines, prescriptions, alerts, isLoading, 
      login, logout, createPrescription, updatePrescription, dispensePrescription, recordInventoryRemoval, resolveAlert, updateInventory 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
