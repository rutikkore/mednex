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
- **Backend & Database**: Supabase (PostgreSQL, Authentication, Real-time Prescriptions)
- **Maps & Routing**: Leaflet (via `react-leaflet`)
- **State Management**: React Context API (`useAuth`, `useHospital`)
- **Routing**: React Router (`react-router-dom`)

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

---

## 🔑 Key Roles & Features

### 1. Patient Interface
Designed for quick access to critical information.
- **Emergency Redirect**: Automatic location-based search for the nearest hospital with available **ICU**, **Cardiac**, or **General** beds.
- **Token System**: Book OPD appointments and track queue status in real-time to avoid waiting in crowds.
- **Blood Bank View**: Check real-time stock levels of different blood groups across connected blood banks.
- **Live Dashboard**: View personal appointments and health status.

### 2. Receptionist / Staff Interface
Operational dashboard for hospital staff to manage on-ground resources.
- **Bed Management**: Update real-time availability of ICU, General, and Cardiac beds.
- **Counter Console**: Manage patient queues, call next tokens, and mark visits as completed.
- **Blood Bank Control**: Update blood stock levels (A+, B-, O+, etc.) instantly.

### 3. Administrator Interface
Strategic overview for hospital administrators.
- **Analytics**: View system-wide metrics.
- **User Management**: Manage staff accounts and permissions.

### 4. Authentication & Security
- **Supabase Auth**: Secure email/password login and registration.
- **Role-Based Access Control (RBAC)**: Protected routes ensure patients cannot access staff controls and vice versa.
- **Profiles Table**: Links authentication data to application-specific user roles (`patient`, `receptionist`, `admin`, `doctor`).

---

## 🔄 Emergency Logic (The "Brain")
The **EmergencyRedirect** module (`frontend/src/pages/EmergencyRedirect.tsx`) is the system's most crucial feature. It:
1. **Fetches** all hospitals from Supabase.
2. **Calculates Distances** from the user's selected location to all facilities.
3. **Filters** hospitals that have valid availability for the specific required bed type (ICU/Cardiac/General).
4. **Ranks** them by proximity using a distance algorithm.
5. **Directs** the user to the best facility with turn-by-turn navigation link.
