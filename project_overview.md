# MedNexus Project Overview

**MedNexus** is a comprehensive, real-time hospital resource management and emergency response system. It bridges the gap between patients seeking critical care and hospitals managing limited resources like beds and blood supplies.

## 🚀 Core Mission
To reduce emergency response times and optimize hospital resource allocation by providing real-time data on bed availability, blood bank stocks, and OPD queues.

## 🛠️ Technology Stack
- **Frontend**: React (Vite), TypeScript, TailwindCSS
- **Backend & Database**: Supabase (PostgreSQL, Authentication, Real-time RPCs, Staleness & Notification triggers)
- **Data Visualization**: Recharts (Dynamic Bar, Area, and Pie charts for MetroOps)
- **Maps & Routing**: Leaflet (via `react-leaflet`)
- **State Management**: React Context API (`useAuth`, `useHospital`)
- **Routing**: React Router (`react-router-dom`)
- **UI/UX & Design**: Premium, modern glassmorphic interface with Vercel-like aesthetics, 3D animations, particle effects, parallax scrolling, smooth stagger animations, hover effects, and full dark-mode support for accessible data visualization.

## 🔑 Key Roles & Features

### 1. Patient Interface
Designed for quick access to critical information.
- **AI Triage System**: Intelligent symptom checker with robust logic to accurately categorize required medical departments, prioritizing symptom assessment before token booking.
- **Emergency Redirect**: Automatic location-based search for the nearest hospital with available **ICU**, **Cardiac**, or **General** beds.
- **Token System**: Book OPD appointments and track queue status in real-time to avoid waiting in crowds.
- **Blood Bank View**: Check real-time stock levels of different blood groups across connected blood banks.
- **Live Dashboard**: View personal appointments and health status.

### 2. Receptionist / Staff Interface
Operational dashboard for hospital staff to manage on-ground resources.
- **Bed Management**: Update real-time availability of ICU, General, and Cardiac beds.
- **Counter Console**: Manage patient queues, call next tokens, and mark visits as completed.
- **Blood Bank Control**: Update blood stock levels (A+, B-, O+, etc.) instantly.
- **Global Notification System**: Receive real-time alerts for low blood inventory, critical bed capacity, queue anomalies, and incoming transfer requests.

### 3. Administrator Interface (METROOPS Command Suite)
Strategic control center for hospital administrators and metropolitan grid controllers.
- **Metropolitan Bed Matrix**: Real-time bar charts visualizing ICU, General, and Cardiac bed availability across all nodes.
- **Grid Load Evolution**: Telemetry area charts tracking system throughput and active triage loads.
- **Metropolitan Blood Inventory**: Live pie-chart breakdown of global blood stock, tracking critical scarcities.
- **Grid Audit Generation**: Instantly export live system snapshots, logs, and telemetry matrix data as JSON.

### 4. Core System Infrastructure
- **Data Reliability & Freshness Tracking**: Automated staleness metrics (`step1_staleness.sql`, `FreshnessBadge`) ensure real-time data integrity and prevent UI decay.
- **Inter-Hospital Transfers**: A specialized module for requesting and fulfilling blood transfers between hospital nodes (`step5_blood_transfers.sql`).
- **Role-Based Access Control (RBAC)**: Supabase-driven security separating patients, staff, and admins.

## 📊 Database Schema (Supabase)

### `hospitals`
Stores facility locations and live resource counts.
- `id`: UUID (Primary Key)
- `name`, `address`, `contact`: Basic info
- `lat`, `lng`: Geolocation coordinates
- `icu_total`, `icu_available`: Critical care capacity
- `general_total`, `general_available`: Standard ward capacity
- `cardiac_total`, `cardiac_available`: Specialized cardiac care capacity
- `last_updated`: Tracks staleness for the Data freshness checker

### `blood_banks`
Tracks blood inventory.
- `id`: UUID
- `name`, `city`, `lat`, `lng`: Location info
- `stock`: JSONB object storing counts for each blood group (e.g., `{"A+": 10, "O-": 2}`)
- `inventory_details`: JSONB array storing detailed batch tracking and expiry info.
- `last_updated_at`: Automatically updated via PostgreSQL triggers for the freshness engine.

### `tokens`
Manages the OPD queue system.
- `number`: Token display number (e.g., "A-12")
- `patient_name`: Name of the patient
- `status`: `waiting` | `called` | `completed` | `cancelled`
- `severity`: `normal` | `priority` | `emergency`

### `profiles`
Extends Supabase Auth with custom user data.
- `id`: References `auth.users`
- `email`: User's primary email address
- `role`: `patient` | `receptionist` | `admin` | `doctor`
- `full_name`, `avatar_url`: Display info
- `updated_at`: Timestamp of the last profile modification

### `notifications`
Powers the Global Notification System.
- `id`: UUID
- `hospital_id`: References `hospitals.id`
- `type`: `blood_low` | `bed_critical` | `queue_alert` | `transfer_request`
- `message`: Notification body
- `is_read`: Boolean status

### `blood_transfer_requests`
Facilitates hospital-to-hospital inter-bank transfers.
- `id`: UUID
- `requester_bank_id` / `supplier_bank_id`: References `blood_banks.id`
- `blood_type`: The required stock group
- `units`: Amount requested
- `status`: `pending` | `approved` | `in_transit` | `delivered` | `rejected`
- `updated_at`: Real-time tracking of lifecycle state changes.

## 🔄 Emergency Logic (The "Brain")
The **EmergencyRedirect** module (`frontend/pages/EmergencyRedirect.tsx`) is the system's most crucial feature. It:
1.  **Fetches** all hospitals from Supabase.
2.  **Calculates Distances** from the user's selected location to all facilities.
3.  **Filters** hospitals that have valid availability for the specific required bed type (ICU/Cardiac/General).
4.  **Ranks** them by proximity using a distance algorithm.
5.  **Directs** the user to the best facility with turn-by-turn navigation link.

## 🧩 Frontend Architecture (Hooks & Lifecycle)

The frontend uses custom React hooks to manage real-time state and system integrity:

- **`useSync`**: Ensures global data synchronization across all open sessions.
- **`useNotifications`**: Subscribes to the Supabase `notifications` table for real-time resource alerts.
- **`useDataFreshness`**: Monitors `last_updated_at` fields to display the `FreshnessBadge` and alert users of stale data.
- **`useAuth`**: Manages RBAC and session persistence via Supabase Auth.

## ⚙️ Setup & Onboarding Flow

To ensure a smooth developer experience, the project includes an automated onboarding flow:
1. **Environment Check**: On launch, the app checks for `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
2. **Setup Redirect**: If missing, the user is redirected to `SetupScreen.tsx`.
3. **Database Initialization**: Guided instructions for running `backend/schema.sql` and `backend/seed.sql` to prepare the environment.

## ⚡ Backend Logic & Automation

- **Automated Timestamps**: PostgreSQL triggers (`update_last_updated_at_column`) automatically update the `last_updated_at` column whenever a hospital's resource count or blood bank's stock is modified.
- **Real-time Publications**: The `blood_transfer_requests` table is explicitly added to the `supabase_realtime` publication to enable instant UI state transitions.
