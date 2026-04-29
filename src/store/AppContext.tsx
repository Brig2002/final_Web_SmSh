import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Medicine, Prescription, SystemAlert, UserRole, StockStatus } from '../types';

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
  dispensePrescription: (id: string) => void;
  resolveAlert: (id: string) => void;
  updateInventory: (id: string, newQuantity: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_MEDICINES: Medicine[] = [
  { id: '1', name: 'Amoxicillin 500mg', sku: 'AMX-500-CAP', description: 'Capsules • 30ct bottles', quantity: 12, capacity: 100, expiryDate: '2025-10-15', shelfId: 'SHF-A104', status: 'CRITICAL' },
  { id: '2', name: 'Lisinopril 10mg', sku: 'LIS-010-TAB', description: 'Tablets • 90ct bottles', quantity: 145, capacity: 150, expiryDate: '2024-11-30', shelfId: 'SHF-B202', status: 'NORMAL' },
  { id: '3', name: 'Atorvastatin 20mg', sku: 'ATO-020-TAB', description: 'Tablets • 30ct bottles', quantity: 45, capacity: 200, expiryDate: '2026-05-12', shelfId: 'SHF-C018', status: 'LOW' },
  { id: '4', name: 'Metformin 850mg', sku: 'MET-850-200', description: 'Tablets • 60ct bottles', quantity: 88, capacity: 120, expiryDate: '2026-02-28', shelfId: 'SHF-A090', status: 'NORMAL' },
  { id: '5', name: 'Albuterol Inhaler', sku: 'ALB-INH-085', description: 'Aerosol • 8.5g', quantity: 3, capacity: 50, expiryDate: '2024-08-20', shelfId: 'SHF-D405', status: 'CRITICAL' },
  { id: '6', name: 'Omeprazole 20mg', sku: 'OME-020-CAP', description: 'Capsules • 30ct bottles', quantity: 110, capacity: 150, expiryDate: '2025-01-10', shelfId: 'SHF-B112', status: 'NORMAL' },
];

const INITIAL_PRESCRIPTIONS: Prescription[] = [
  { id: 'p1', patientName: 'Michael Rossi', medicineId: '1', medicineName: 'Amoxicillin 500mg', quantity: 1, date: '2023-10-24', time: '09:41 AM', status: 'READY', doctorId: 'd1', doctorName: 'Dr. Sarah Jenkins' },
  { id: 'p2', patientName: 'Elena Vance', medicineId: '2', medicineName: 'Lisinopril 10mg', quantity: 1, date: '2023-10-24', time: '09:15 AM', status: 'PROCESSING', doctorId: 'd1', doctorName: 'Dr. Sarah Jenkins' },
  { id: 'p3', patientName: 'David Wallace', medicineId: '3', medicineName: 'Atorvastatin 20mg', quantity: 1, date: '2023-10-23', time: '04:30 PM', status: 'REVIEW', doctorId: 'd2', doctorName: 'Dr. Michael Scott' },
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

  const createPrescription = (data: Partial<Prescription>) => {
    if (!user) return;
    const newP: Prescription = {
      id: 'p' + (prescriptions.length + 1),
      patientName: data.patientName || 'Unknown',
      medicineId: data.medicineId || '1',
      medicineName: data.medicineName || 'Unknown Medicine',
      quantity: data.quantity || 1,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'PENDING',
      doctorId: user.id,
      doctorName: user.name,
    };
    setPrescriptions([newP, ...prescriptions]);
  };

  const dispensePrescription = (id: string) => {
    setPrescriptions(prev => prev.map(p => {
      if (p.id === id) {
        // Decrease medicine stock when dispensed
        const medicine = medicines.find(m => m.id === p.medicineId);
        if (medicine) {
          updateInventory(medicine.id, medicine.quantity - 1);
        }
        return { ...p, status: 'FULFILLED' };
      }
      return p;
    }));
  };

  const resolveAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
  };

  const updateInventory = (id: string, newQuantity: number) => {
    setMedicines(prev => prev.map(m => {
      if (m.id === id) {
        const status: StockStatus = newQuantity <= 5 ? 'CRITICAL' : newQuantity <= 15 ? 'LOW' : 'NORMAL';
        return { ...m, quantity: newQuantity, status };
      }
      return m;
    }));
  };

  // Simulation: Random stock fluctuations to show "Real-time" effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const randomIndex = Math.floor(Math.random() * medicines.length);
        const medicine = medicines[randomIndex];
        if (medicine.quantity > 0) {
          updateInventory(medicine.id, medicine.quantity - 1);
        }
      }
    }, 10000); // Every 10 seconds
    return () => clearInterval(interval);
  }, [medicines]);

  return (
    <AppContext.Provider value={{ 
      user, medicines, prescriptions, alerts, isLoading, 
      login, logout, createPrescription, dispensePrescription, resolveAlert, updateInventory 
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
