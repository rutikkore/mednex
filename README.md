# 🏥 MedNexus

**MedNexus** is a comprehensive, real-time hospital resource management and emergency response system. It bridges the gap between patients seeking critical care and hospitals managing limited resources like beds and blood supplies.

---

## 🚀 Core Mission
To reduce emergency response times and optimize hospital resource allocation by providing real-time data on bed availability, blood bank stocks, and OPD queues.

## 📁 Project Structure
The project is strictly organized into separate environments to keep the codebase clean and maintainable:

- **`/frontend`**: Contains the Vite React application, UI components, pages, hooks, and Supabase client integrations.
- **`/backend`**: Contains database schemas, SQL repair and seeding scripts, and Node.js database verification tools (`verify-db.js`).

## 🛠️ Technology Stack
- **Frontend**: React (Vite), TypeScript, TailwindCSS
- **Backend & Database**: Supabase (PostgreSQL, Authentication, Real-time RPCs, Staleness & Notification triggers)
- **Data Visualization**: Recharts (Dynamic Bar, Area, and Pie charts for MetroOps)
- **Maps & Routing**: Leaflet (via `react-leaflet`)
- **State Management**: React Context API (`useAuth`, `useHospital`)
- **Routing**: React Router (`react-router-dom`)
- **UI/UX & Design**: Premium, modern glassmorphic interface with Vercel-like aesthetics, 3D animations, particle effects, parallax scrolling, smooth stagger animations, hover effects, and full dark-mode support.
- **Onboarding**: Integrated `SetupScreen` for guided Supabase configuration and environment validation.

## 🚦 Getting Started

### Prerequisites
Make sure you have **Node.js** and **NPM** installed.

### Installation
1. Clone the repository and navigate into the project root.
2. Install the necessary frontend dependencies by running the following command from the root folder:
   ```bash
   npm run install:all
   ```

### Running the Application
You can start the development server directly from the root of the project. The root `package.json` acts as an umbrella runner that automatically starts the Vite application inside the `frontend` folder:

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser to view the application!

> [!NOTE]
> If environment variables are missing, the app will automatically redirect to the **Setup Screen** to guide you through the Supabase connection process.

---

## 🔑 Key Roles & Features

### 1. Patient Interface
Designed for quick access to critical information.
- **AI Triage System**: Intelligent symptom checker that accurately categorizes required medical departments, guiding patients effectively prior to appointment scheduling.
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
- **Data Reliability & Freshness Tracking**: Automated staleness metrics (`step1_staleness.sql`, `FreshnessBadge`, and the `useDataFreshness` hook) ensure real-time data integrity and prevent UI decay. PostgreSQL triggers automatically maintain `last_updated_at` records.
- **Inter-Hospital Transfers**: A specialized module for requesting and fulfilling blood transfers between hospital nodes (`step5_blood_transfers.sql`). Now supports extended states: `pending`, `approved`, `in_transit`, `delivered`, and `rejected`.
- **Global Notification System**: Real-time alerts for low blood inventory, critical bed capacity, and transfer requests, powered by PostgreSQL triggers.
- **Role-Based Access Control (RBAC)**: Supabase-driven security separating patients, staff, and admins via `AuthPage`.
- **Global Notification System**: Powered by PostgreSQL database triggers and the `useNotifications` real-time hook to deliver critical resource alerts instantly.

---

## 🔄 Emergency Logic (The "Brain")
The **EmergencyRedirect** module (`frontend/src/pages/EmergencyRedirect.tsx`) is the system's most crucial feature. It:
1. **Fetches** all hospitals from Supabase.
2. **Calculates Distances** from the user's selected location to all facilities.
3. **Filters** hospitals that have valid availability for the specific required bed type (ICU/Cardiac/General).
4. **Ranks** them by proximity using a distance algorithm.
5. **Directs** the user to the best facility with turn-by-turn navigation link.
