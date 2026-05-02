import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Medicine, Prescription, SystemAlert, UserRole, StockStatus, MedicineAllocation } from '../types';
import { getDaysUntilExpiry, isExpired, isExpiryWarning } from '../lib/utils';

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
    barcode: '5901234100001', 
    description: 'Capsules • 30ct bottles', 
    batchId: 'BATCH-001',
    quantity: 8,
    expiryDate: '2025-10-15',
    manufacturingDate: '2024-10-15',
    capacity: 100, 
    shelfId: 'SHF-A104', 
    status: 'CRITICAL' 
  },
  { 
    id: '1a', 
    name: 'Amoxicillin 500mg', 
    sku: 'AMX-500-CAP', 
    barcode: '5901234100002', 
    description: 'Capsules • 30ct bottles', 
    batchId: 'BATCH-002',
    quantity: 4,
    expiryDate: '2026-02-20',
    manufacturingDate: '2024-08-20',
    capacity: 100, 
    shelfId: 'SHF-A104', 
    status: 'NORMAL' 
  },
  { 
    id: '2', 
    name: 'Lisinopril 10mg', 
    sku: 'LIS-010-TAB', 
    barcode: '5901234100018', 
    description: 'Tablets • 90ct bottles', 
    batchId: 'BATCH-003',
    quantity: 145,
    expiryDate: '2026-11-30',
    manufacturingDate: '2024-11-30',
    capacity: 150, 
    shelfId: 'SHF-B202', 
    status: 'NORMAL' 
  },
  { 
    id: '3', 
    name: 'Atorvastatin 20mg', 
    sku: 'ATO-020-TAB', 
    barcode: '5901234100025', 
    description: 'Tablets • 30ct bottles', 
    batchId: 'BATCH-004',
    quantity: 30,
    expiryDate: '2026-05-12',
    manufacturingDate: '2024-05-12',
    capacity: 200, 
    shelfId: 'SHF-C018', 
    status: 'NORMAL' 
  },
  { 
    id: '3a', 
    name: 'Atorvastatin 20mg', 
    sku: 'ATO-020-TAB', 
    barcode: '5901234100032', 
    description: 'Tablets • 30ct bottles', 
    batchId: 'BATCH-005',
    quantity: 15,
    expiryDate: '2028-05-12',
    manufacturingDate: '2024-05-12',
    capacity: 200, 
    shelfId: 'SHF-C018', 
    status: 'NORMAL' 
  },
  { 
    id: '4', 
    name: 'Metformin 850mg', 
    sku: 'MET-850-200', 
    barcode: '5901234006001', 
    description: 'Tablets • 60ct bottles', 
    batchId: 'BATCH-006',
    quantity: 1,
    expiryDate: '2026-02-28',
    manufacturingDate: '2023-02-28',
    capacity: 120, 
    shelfId: 'SHF-A090', 
    status: 'EXPIRED' 
  },
  { 
    id: '4_1', 
    name: 'Metformin 850mg', 
    sku: 'MET-850-200', 
    barcode: '5901234006002', 
    description: 'Tablets • 60ct bottles', 
    batchId: 'BATCH-006',
    quantity: 1,
    expiryDate: '2026-02-28',
    manufacturingDate: '2023-02-28',
    capacity: 120, 
    shelfId: 'SHF-A090', 
    status: 'EXPIRED' 
  },
  { 
    id: '4_2', 
    name: 'Metformin 850mg', 
    sku: 'MET-850-200', 
    barcode: '5901234006003', 
    description: 'Tablets • 60ct bottles', 
    batchId: 'BATCH-006',
    quantity: 1,
    expiryDate: '2026-02-28',
    manufacturingDate: '2023-02-28',
    capacity: 120, 
    shelfId: 'SHF-A090', 
    status: 'EXPIRED' 
  },
  { 
    id: '4_3', 
    name: 'Metformin 850mg', 
    sku: 'MET-850-200', 
    barcode: '5901234006004', 
    description: 'Tablets • 60ct bottles', 
    batchId: 'BATCH-006',
    quantity: 1,
    expiryDate: '2026-02-28',
    manufacturingDate: '2023-02-28',
    capacity: 120, 
    shelfId: 'SHF-A090', 
    status: 'EXPIRED' 
  },
  { 
    id: '4_4', 
    name: 'Metformin 850mg', 
    sku: 'MET-850-200', 
    barcode: '5901234006005', 
    description: 'Tablets • 60ct bottles', 
    batchId: 'BATCH-006',
    quantity: 1,
    expiryDate: '2026-02-28',
    manufacturingDate: '2023-02-28',
    capacity: 120, 
    shelfId: 'SHF-A090', 
    status: 'EXPIRED' 
  },
  { 
    id: '4_5', 
    name: 'Metformin 850mg', 
    sku: 'MET-850-200', 
    barcode: '5901234006006', 
    description: 'Tablets • 60ct bottles', 
    batchId: 'BATCH-006',
    quantity: 1,
    expiryDate: '2026-02-28',
    manufacturingDate: '2023-02-28',
    capacity: 120, 
    shelfId: 'SHF-A090', 
    status: 'EXPIRED' 
  },
  { 
    id: '4_6', 
    name: 'Metformin 850mg', 
    sku: 'MET-850-200', 
    barcode: '5901234006007', 
    description: 'Tablets • 60ct bottles', 
    batchId: 'BATCH-006',
    quantity: 1,
    expiryDate: '2026-02-28',
    manufacturingDate: '2023-02-28',
    capacity: 120, 
    shelfId: 'SHF-A090', 
    status: 'EXPIRED' 
  },
  { 
    id: '4_7', 
    name: 'Metformin 850mg', 
    sku: 'MET-850-200', 
    barcode: '5901234006008', 
    description: 'Tablets • 60ct bottles', 
    batchId: 'BATCH-006',
    quantity: 1,
    expiryDate: '2026-02-28',
    manufacturingDate: '2023-02-28',
    capacity: 120, 
    shelfId: 'SHF-A090', 
    status: 'EXPIRED' 
  },
  { 
    id: '4_8', 
    name: 'Metformin 850mg', 
    sku: 'MET-850-200', 
    barcode: '5901234006009', 
    description: 'Tablets • 60ct bottles', 
    batchId: 'BATCH-006',
    quantity: 1,
    expiryDate: '2026-02-28',
    manufacturingDate: '2023-02-28',
    capacity: 120, 
    shelfId: 'SHF-A090', 
    status: 'EXPIRED' 
  },
  { 
    id: '4_9', 
    name: 'Metformin 850mg', 
    sku: 'MET-850-200', 
    barcode: '5901234006010', 
    description: 'Tablets • 60ct bottles', 
    batchId: 'BATCH-006',
    quantity: 1,
    expiryDate: '2026-02-28',
    manufacturingDate: '2023-02-28',
    capacity: 120, 
    shelfId: 'SHF-A090', 
    status: 'EXPIRED' 
  },
  { 
    id: '4_10', 
    name: 'Metformin 850mg', 
    sku: 'MET-850-200', 
    barcode: '5901234006011', 
    description: 'Tablets • 60ct bottles', 
    batchId: 'BATCH-006',
    quantity: 1,
    expiryDate: '2026-02-28',
    manufacturingDate: '2023-02-28',
    capacity: 120, 
    shelfId: 'SHF-A090', 
    status: 'EXPIRED' 
  },
  { 
    id: '4_11', 
    name: 'Metformin 850mg', 
    sku: 'MET-850-200', 
    barcode: '5901234006012', 
    description: 'Tablets • 60ct bottles', 
    batchId: 'BATCH-006',
    quantity: 1,
    expiryDate: '2026-02-28',
    manufacturingDate: '2023-02-28',
    capacity: 120, 
    shelfId: 'SHF-A090', 
    status: 'EXPIRED' 
  },
  { 
    id: '4_12', 
    name: 'Metformin 850mg', 
    sku: 'MET-850-200', 
    barcode: '5901234006013', 
    description: 'Tablets • 60ct bottles', 
    batchId: 'BATCH-006',
    quantity: 1,
    expiryDate: '2026-02-28',
    manufacturingDate: '2023-02-28',
    capacity: 120, 
    shelfId: 'SHF-A090', 
    status: 'EXPIRED' 
  },
  { 
    id: '4_13', 
    name: 'Metformin 850mg', 
    sku: 'MET-850-200', 
    barcode: '5901234006014', 
    description: 'Tablets • 60ct bottles', 
    batchId: 'BATCH-006',
    quantity: 1,
    expiryDate: '2026-02-28',
    manufacturingDate: '2023-02-28',
    capacity: 120, 
    shelfId: 'SHF-A090', 
    status: 'EXPIRED' 
  },
  { 
    id: '4_14', 
    name: 'Metformin 850mg', 
    sku: 'MET-850-200', 
    barcode: '5901234006015', 
    description: 'Tablets • 60ct bottles', 
    batchId: 'BATCH-006',
    quantity: 1,
    expiryDate: '2026-02-28',
    manufacturingDate: '2023-02-28',
    capacity: 120, 
    shelfId: 'SHF-A090', 
    status: 'EXPIRED' 
  },
  { 
    id: '4_15', 
    name: 'Metformin 850mg', 
    sku: 'MET-850-200', 
    barcode: '5901234006016', 
    description: 'Tablets • 60ct bottles', 
    batchId: 'BATCH-006',
    quantity: 1,
    expiryDate: '2026-02-28',
    manufacturingDate: '2023-02-28',
    capacity: 120, 
    shelfId: 'SHF-A090', 
    status: 'EXPIRED' 
  },
  { 
    id: '4_16', 
    name: 'Metformin 850mg', 
    sku: 'MET-850-200', 
    barcode: '5901234006017', 
    description: 'Tablets • 60ct bottles', 
    batchId: 'BATCH-006',
    quantity: 1,
    expiryDate: '2026-02-28',
    manufacturingDate: '2023-02-28',
    capacity: 120, 
    shelfId: 'SHF-A090', 
    status: 'EXPIRED' 
  },
  { 
    id: '4_17', 
    name: 'Metformin 850mg', 
    sku: 'MET-850-200', 
    barcode: '5901234006018', 
    description: 'Tablets • 60ct bottles', 
    batchId: 'BATCH-006',
    quantity: 1,
    expiryDate: '2026-02-28',
    manufacturingDate: '2023-02-28',
    capacity: 120, 
    shelfId: 'SHF-A090', 
    status: 'EXPIRED' 
  },
  { 
    id: '4_18', 
    name: 'Metformin 850mg', 
    sku: 'MET-850-200', 
    barcode: '5901234006019', 
    description: 'Tablets • 60ct bottles', 
    batchId: 'BATCH-006',
    quantity: 1,
    expiryDate: '2026-02-28',
    manufacturingDate: '2023-02-28',
    capacity: 120, 
    shelfId: 'SHF-A090', 
    status: 'EXPIRED' 
  },
  { 
    id: '4_19', 
    name: 'Metformin 850mg', 
    sku: 'MET-850-200', 
    barcode: '5901234006020', 
    description: 'Tablets • 60ct bottles', 
    batchId: 'BATCH-006',
    quantity: 1,
    expiryDate: '2026-02-28',
    manufacturingDate: '2023-02-28',
    capacity: 120, 
    shelfId: 'SHF-A090', 
    status: 'EXPIRED' 
  },
  { 
    id: '4_20', 
    name: 'Metformin 850mg', 
    sku: 'MET-850-200', 
    barcode: '5901234006021', 
    description: 'Tablets • 60ct bottles', 
    batchId: 'BATCH-006',
    quantity: 1,
    expiryDate: '2026-02-28',
    manufacturingDate: '2023-02-28',
    capacity: 120, 
    shelfId: 'SHF-A090', 
    status: 'EXPIRED' 
  },
  { 
    id: '4_21', 
    name: 'Metformin 850mg', 
    sku: 'MET-850-200', 
    barcode: '5901234006022', 
    description: 'Tablets • 60ct bottles', 
    batchId: 'BATCH-006',
    quantity: 1,
    expiryDate: '2026-02-28',
    manufacturingDate: '2023-02-28',
    capacity: 120, 
    shelfId: 'SHF-A090', 
    status: 'EXPIRED' 
  },
  { 
    id: '4_22', 
    name: 'Metformin 850mg', 
    sku: 'MET-850-200', 
    barcode: '5901234006023', 
    description: 'Tablets • 60ct bottles', 
    batchId: 'BATCH-006',
    quantity: 1,
    expiryDate: '2026-02-28',
    manufacturingDate: '2023-02-28',
    capacity: 120, 
    shelfId: 'SHF-A090', 
    status: 'EXPIRED' 
  },
  { 
    id: '4_23', 
    name: 'Metformin 850mg', 
    sku: 'MET-850-200', 
    barcode: '5901234006024', 
    description: 'Tablets • 60ct bottles', 
    batchId: 'BATCH-006',
    quantity: 1,
    expiryDate: '2026-02-28',
    manufacturingDate: '2023-02-28',
    capacity: 120, 
    shelfId: 'SHF-A090', 
    status: 'EXPIRED' 
  },
  { 
    id: '4_24', 
    name: 'Metformin 850mg', 
    sku: 'MET-850-200', 
    barcode: '5901234006025', 
    description: 'Tablets • 60ct bottles', 
    batchId: 'BATCH-006',
    quantity: 1,
    expiryDate: '2026-02-28',
    manufacturingDate: '2023-02-28',
    capacity: 120, 
    shelfId: 'SHF-A090', 
    status: 'EXPIRED' 
  },
  { 
    id: '4_25', 
    name: 'Metformin 850mg', 
    sku: 'MET-850-200', 
    barcode: '5901234006026', 
    description: 'Tablets • 60ct bottles', 
    batchId: 'BATCH-006',
    quantity: 1,
    expiryDate: '2026-02-28',
    manufacturingDate: '2023-02-28',
    capacity: 120, 
    shelfId: 'SHF-A090', 
    status: 'EXPIRED' 
  },
  { 
    id: '4_26', 
    name: 'Metformin 850mg', 
    sku: 'MET-850-200', 
    barcode: '5901234006027', 
    description: 'Tablets • 60ct bottles', 
    batchId: 'BATCH-006',
    quantity: 1,
    expiryDate: '2026-02-28',
    manufacturingDate: '2023-02-28',
    capacity: 120, 
    shelfId: 'SHF-A090', 
    status: 'EXPIRED' 
  },
  { 
    id: '4_27', 
    name: 'Metformin 850mg', 
    sku: 'MET-850-200', 
    barcode: '5901234006028', 
    description: 'Tablets • 60ct bottles', 
    batchId: 'BATCH-006',
    quantity: 1,
    expiryDate: '2026-02-28',
    manufacturingDate: '2023-02-28',
    capacity: 120, 
    shelfId: 'SHF-A090', 
    status: 'EXPIRED' 
  },
  { 
    id: '4_28', 
    name: 'Metformin 850mg', 
    sku: 'MET-850-200', 
    barcode: '5901234006029', 
    description: 'Tablets • 60ct bottles', 
    batchId: 'BATCH-006',
    quantity: 1,
    expiryDate: '2026-02-28',
    manufacturingDate: '2023-02-28',
    capacity: 120, 
    shelfId: 'SHF-A090', 
    status: 'EXPIRED' 
  },
  { 
    id: '4_29', 
    name: 'Metformin 850mg', 
    sku: 'MET-850-200', 
    barcode: '5901234006030', 
    description: 'Tablets • 60ct bottles', 
    batchId: 'BATCH-006',
    quantity: 1,
    expiryDate: '2026-02-28',
    manufacturingDate: '2023-02-28',
    capacity: 120, 
    shelfId: 'SHF-A090', 
    status: 'EXPIRED' 
  },
  { 
    id: '4_30', 
    name: 'Metformin 850mg', 
    sku: 'MET-850-200', 
    barcode: '5901234006031', 
    description: 'Tablets • 60ct bottles', 
    batchId: 'BATCH-006',
    quantity: 1,
    expiryDate: '2026-02-28',
    manufacturingDate: '2023-02-28',
    capacity: 120, 
    shelfId: 'SHF-A090', 
    status: 'EXPIRED' 
  },
  { 
    id: '4_31', 
    name: 'Metformin 850mg', 
    sku: 'MET-850-200', 
    barcode: '5901234006032', 
    description: 'Tablets • 60ct bottles', 
    batchId: 'BATCH-006',
    quantity: 1,
    expiryDate: '2026-02-28',
    manufacturingDate: '2023-02-28',
    capacity: 120, 
    shelfId: 'SHF-A090', 
    status: 'EXPIRED' 
  },
  { 
    id: '4_32', 
    name: 'Metformin 850mg', 
    sku: 'MET-850-200', 
    barcode: '5901234006033', 
    description: 'Tablets • 60ct bottles', 
    batchId: 'BATCH-006',
    quantity: 1,
    expiryDate: '2026-02-28',
    manufacturingDate: '2023-02-28',
    capacity: 120, 
    shelfId: 'SHF-A090', 
    status: 'EXPIRED' 
  },
  { 
    id: '4_33', 
    name: 'Metformin 850mg', 
    sku: 'MET-850-200', 
    barcode: '5901234006034', 
    description: 'Tablets • 60ct bottles', 
    batchId: 'BATCH-006',
    quantity: 1,
    expiryDate: '2026-02-28',
    manufacturingDate: '2023-02-28',
    capacity: 120, 
    shelfId: 'SHF-A090', 
    status: 'EXPIRED' 
  },
  { 
    id: '4_34', 
    name: 'Metformin 850mg', 
    sku: 'MET-850-200', 
    barcode: '5901234006035', 
    description: 'Tablets • 60ct bottles', 
    batchId: 'BATCH-006',
    quantity: 1,
    expiryDate: '2026-02-28',
    manufacturingDate: '2023-02-28',
    capacity: 120, 
    shelfId: 'SHF-A090', 
    status: 'EXPIRED' 
  },
  { 
    id: '4_35', 
    name: 'Metformin 850mg', 
    sku: 'MET-850-200', 
    barcode: '5901234006036', 
    description: 'Tablets • 60ct bottles', 
    batchId: 'BATCH-006',
    quantity: 1,
    expiryDate: '2026-02-28',
    manufacturingDate: '2023-02-28',
    capacity: 120, 
    shelfId: 'SHF-A090', 
    status: 'EXPIRED' 
  },
  { 
    id: '4_36', 
    name: 'Metformin 850mg', 
    sku: 'MET-850-200', 
    barcode: '5901234006037', 
    description: 'Tablets • 60ct bottles', 
    batchId: 'BATCH-006',
    quantity: 1,
    expiryDate: '2026-02-28',
    manufacturingDate: '2023-02-28',
    capacity: 120, 
    shelfId: 'SHF-A090', 
    status: 'EXPIRED' 
  },
  { 
    id: '4_37', 
    name: 'Metformin 850mg', 
    sku: 'MET-850-200', 
    barcode: '5901234006038', 
    description: 'Tablets • 60ct bottles', 
    batchId: 'BATCH-006',
    quantity: 1,
    expiryDate: '2026-02-28',
    manufacturingDate: '2023-02-28',
    capacity: 120, 
    shelfId: 'SHF-A090', 
    status: 'EXPIRED' 
  },
  { 
    id: '4_38', 
    name: 'Metformin 850mg', 
    sku: 'MET-850-200', 
    barcode: '5901234006039', 
    description: 'Tablets • 60ct bottles', 
    batchId: 'BATCH-006',
    quantity: 1,
    expiryDate: '2026-02-28',
    manufacturingDate: '2023-02-28',
    capacity: 120, 
    shelfId: 'SHF-A090', 
    status: 'EXPIRED' 
  },
  { 
    id: '4a', 
    name: 'Metformin 850mg', 
    sku: 'MET-850-200', 
    barcode: '5901234123464', 
    description: 'Tablets • 60ct bottles', 
    batchId: 'BATCH-007',
    quantity: 35,
    expiryDate: '2026-05-15',
    manufacturingDate: '2023-05-15',
    capacity: 120, 
    shelfId: 'SHF-A090', 
    status: 'LOW' 
  },
  { 
    id: '4b', 
    name: 'Metformin 850mg', 
    sku: 'MET-850-200', 
    barcode: '5901234123471', 
    description: 'Tablets • 60ct bottles', 
    batchId: 'BATCH-008',
    quantity: 13,
    expiryDate: '2026-10-28',
    manufacturingDate: '2024-04-28',
    capacity: 120, 
    shelfId: 'SHF-A090', 
    status: 'NORMAL' 
  },
  { 
    id: '5', 
    name: 'Albuterol Inhaler', 
    sku: 'ALB-INH-085', 
    barcode: '5901234567890', 
    description: 'Aerosol • 8.5g', 
    batchId: 'BATCH-009',
    quantity: 3,
    expiryDate: '2025-08-20',
    manufacturingDate: '2023-08-20',
    capacity: 50, 
    shelfId: 'SHF-D405', 
    status: 'CRITICAL' 
  },
  { 
    id: '6', 
    name: 'Omeprazole 20mg', 
    sku: 'OME-020-CAP', 
    barcode: '5901234567907', 
    description: 'Capsules • 30ct bottles', 
    batchId: 'BATCH-010',
    quantity: 60,
    expiryDate: '2026-05-12',
    manufacturingDate: '2025-05-12',
    capacity: 150, 
    shelfId: 'SHF-B112', 
    status: 'NORMAL' 
  },
  { 
    id: '6a', 
    name: 'Omeprazole 20mg', 
    sku: 'OME-020-CAP', 
    barcode: '5901234567914', 
    description: 'Capsules • 30ct bottles', 
    batchId: 'BATCH-011',
    quantity: 50,
    expiryDate: '2026-09-18',
    manufacturingDate: '2025-09-18',
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
    // Simple flat structure: just reduce quantity
    if (medicine.quantity < quantityToRemove) {
      return null; // Not enough quantity
    }

    const newQuantity = medicine.quantity - quantityToRemove;
    
    // Calculate new status
    let newStatus: StockStatus = 'NORMAL';
    if (isExpired(medicine.expiryDate)) {
      newStatus = 'EXPIRED';
    } else if (newQuantity <= 5) {
      newStatus = 'CRITICAL';
    } else if (newQuantity <= 15) {
      newStatus = 'LOW';
    }

    return {
      quantity: newQuantity,
      status: newStatus,
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

      // Check if expired for flat structure
      if (isExpired(medicine.expiryDate)) {
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
        // Update quantity directly for flat structure
        const updatedQuantity = newQuantity;
        
        // Determine status based on quantity
        let status: 'NORMAL' | 'LOW' | 'CRITICAL' | 'EXPIRED' = 'NORMAL';
        if (isExpired(m.expiryDate)) {
          status = 'EXPIRED';
        } else if (updatedQuantity === 0) {
          status = 'CRITICAL';
        } else if (updatedQuantity < m.capacity * 0.2) {
          status = 'LOW';
        }
        
        return { ...m, quantity: updatedQuantity, status };
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
      const daysUntilExpiry = getDaysUntilExpiry(medicine.expiryDate);
      
      // Check if expired
      if (isExpired(medicine.expiryDate)) {
        const alertId = `expiry-${medicine.id}`;
        const existingAlert = alerts.find(a => a.id === alertId);
        
        if (!existingAlert) {
          newAlerts.push({
            id: alertId,
            type: 'EXPIRY',
            message: `${medicine.name} - Batch ${medicine.batchId} EXPIRED`,
            details: `Batch ${medicine.batchId} of ${medicine.name} (${medicine.sku}) expired on ${medicine.expiryDate}. Quantity: ${medicine.quantity} units. Location: ${medicine.shelfId}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            resolved: false,
            severity: 'HIGH',
            sku: medicine.sku,
            location: medicine.shelfId,
          });
        }
      }
      // Check if expiring within 14 days
      else if (isExpiryWarning(medicine.expiryDate, 14)) {
        const alertId = `expiry-warning-${medicine.id}`;
        const existingAlert = alerts.find(a => a.id === alertId);
        
        if (!existingAlert) {
          newAlerts.push({
            id: alertId,
            type: 'EXPIRY',
            message: `${medicine.name} - Batch ${medicine.batchId} Expiring Soon`,
            details: `Batch ${medicine.batchId} of ${medicine.name} (${medicine.sku}) will expire in ${daysUntilExpiry} days on ${medicine.expiryDate}. Quantity: ${medicine.quantity} units. Location: ${medicine.shelfId}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            resolved: false,
            severity: 'MEDIUM',
            sku: medicine.sku,
            location: medicine.shelfId,
          });
        }
      }
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
        if (medicine.quantity > 0) {
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
