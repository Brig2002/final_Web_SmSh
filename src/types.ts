export type UserRole = 'DOCTOR' | 'PHARMACIST' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar?: string;
}

export type StockStatus = 'NORMAL' | 'LOW' | 'CRITICAL' | 'EXPIRED';

export interface Medicine {
  id: string;
  name: string;
  sku: string;
  description: string;
  quantity: number;
  capacity: number;
  expiryDate: string;
  shelfId: string;
  status: StockStatus;
}

export type PrescriptionStatus = 'PENDING' | 'PROCESSING' | 'READY' | 'FULFILLED' | 'REVIEW';

export interface Prescription {
  id: string;
  patientName: string;
  medicineId: string;
  medicineName: string;
  quantity: number;
  date: string;
  time: string;
  status: PrescriptionStatus;
  doctorId: string;
  doctorName: string;
}

export type AlertType = 'UNAUTHORIZED' | 'LOW_STOCK' | 'EXPIRY' | 'SYSTEM';

export interface SystemAlert {
  id: string;
  type: AlertType;
  message: string;
  details: string;
  timestamp: string;
  resolved: boolean;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  sku?: string;
  location?: string;
}
