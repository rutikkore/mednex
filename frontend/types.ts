
export type UserRole = 'patient' | 'receptionist' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Hospital {
  id: string;
  name: string;
  location: [number, number]; // lat, lng
  address: string;
  contact: string;
  beds: {
    icu: { total: number; available: number };
    general: { total: number; available: number };
    cardiac: { total: number; available: number };
  };
  last_updated_at?: string;
}

export interface BloodBankData {
  id: string;
  name: string;
  location: [number, number];
  city: string;
  stock: Record<string, number>; // e.g., "A+": 10
  last_updated_at?: string;
}

export interface Token {
  id: string;
  number: string;
  patientName: string;
  service: string;
  severity: 'normal' | 'priority' | 'emergency';
  status: 'waiting' | 'called' | 'complete' | 'skipped';
  eta: string;
  timestamp: string;
}
