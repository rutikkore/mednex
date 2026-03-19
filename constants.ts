
import { Hospital, BloodBankData, Token } from './types';

export const MUMBAI_CENTER: [number, number] = [19.0760, 72.8777];

export const INDIAN_HOSPITALS: Hospital[] = [
  {
    id: 'h1',
    name: 'Tata Memorial Hospital',
    location: [19.0040, 72.8436],
    address: 'Dr. E, Ernest Borges Rd, Parel, Mumbai, Maharashtra 400012',
    contact: '022-24177000',
    beds: {
      icu: { total: 60, available: 0 }, // Set to 0 to demonstrate auto-redirect
      general: { total: 400, available: 15 },
      cardiac: { total: 30, available: 0 }
    }
  },
  {
    id: 'h2',
    name: 'KEM Hospital',
    location: [19.0025, 72.8425],
    address: 'Acharya Donde Marg, Parel, Mumbai, Maharashtra 400012',
    contact: '022-24107000',
    beds: {
      icu: { total: 80, available: 5 },
      general: { total: 1800, available: 42 },
      cardiac: { total: 40, available: 3 }
    }
  },
  {
    id: 'h3',
    name: 'Lilavati Hospital & Research Centre',
    location: [19.0514, 72.8285],
    address: 'A-791, Bandra Reclamation Rd, Bandra West, Mumbai, Maharashtra 400050',
    contact: '022-26751000',
    beds: {
      icu: { total: 50, available: 12 },
      general: { total: 323, available: 58 },
      cardiac: { total: 35, available: 8 }
    }
  },
  {
    id: 'h4',
    name: 'Nanavati Max Super Speciality Hospital',
    location: [19.1002, 72.8358],
    address: 'S.V. Road, Vile Parle West, Mumbai, Maharashtra 400056',
    contact: '022-26267500',
    beds: {
      icu: { total: 75, available: 10 },
      general: { total: 350, available: 45 },
      cardiac: { total: 25, available: 5 }
    }
  },
  {
    id: 'h5',
    name: 'Sir H. N. Reliance Foundation Hospital',
    location: [18.9587, 72.8202],
    address: 'Raja Rammohan Roy Rd, Prarthana Samaj, Girgaon, Mumbai, Maharashtra 400004',
    contact: '022-61306130',
    beds: {
      icu: { total: 100, available: 18 },
      general: { total: 345, available: 112 },
      cardiac: { total: 50, available: 14 }
    }
  }
];

export const BLOOD_BANKS: BloodBankData[] = [
  {
    id: 'bb1',
    name: 'Arpan Blood Bank',
    location: [19.0433, 72.8231],
    city: 'Mumbai',
    stock: { 'A+': 30, 'A-': 10, 'B+': 25, 'B-': 5, 'O+': 0, 'O-': 8, 'AB+': 12, 'AB-': 4 }
  },
  {
    id: 'bb2',
    name: 'Samarpan Blood Bank',
    location: [19.1176, 72.8485],
    city: 'Mumbai',
    stock: { 'A+': 15, 'A-': 5, 'B+': 20, 'B-': 2, 'O+': 35, 'O-': 4, 'AB+': 10, 'AB-': 2 }
  },
  {
    id: 'bb3',
    name: 'Think Foundation',
    location: [18.9402, 72.8352],
    city: 'Mumbai',
    stock: { 'A+': 12, 'A-': 2, 'B+': 18, 'B-': 1, 'O+': 22, 'O-': 0, 'AB+': 6, 'AB-': 1 }
  }
];

export const MOCK_TOKENS: Token[] = [
  { id: 't1', number: 'A-102', patientName: 'Rahul Sharma', service: 'Cardiology', severity: 'normal', status: 'waiting', eta: '12m', timestamp: '10:30 AM' },
  { id: 't2', number: 'A-103', patientName: 'Priya Singh', service: 'General Medicine', severity: 'priority', status: 'called', eta: 'Now', timestamp: '10:35 AM' },
  { id: 't3', number: 'E-001', patientName: 'Emergency Case', service: 'Trauma', severity: 'emergency', status: 'waiting', eta: '2m', timestamp: '10:40 AM' },
];

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
