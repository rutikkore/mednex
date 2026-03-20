MedNexus Project Overview
MedNexus is a comprehensive, real-time hospital resource management and emergency response system. It bridges the gap between patients seeking critical care and hospitals managing limited resources like beds and blood supplies.

🚀 Core Mission
To reduce emergency response times and optimize hospital resource allocation by providing real-time data on bed availability, blood bank stocks, and OPD queues.

🛠️ Technology Stack
Frontend: React (Vite), TypeScript, TailwindCSS
Backend & Database: Supabase (PostgreSQL, Authentication, Real-time Prescriptions)
Maps & Routing: Leaflet (via react-leaflet)
State Management: React Context API (useAuth, useHospital)
Routing: React Router (react-router-dom)
🔑 Key Roles & Features
1. Patient Interface
Designed for quick access to critical information.

Emergency Redirect: Automatic location-based search for the nearest hospital with available ICU, Cardiac, or General beds.
Token System: Book OPD appointments and track queue status in real-time to avoid waiting in crowds.
Blood Bank View: Check real-time stock levels of different blood groups across connected blood banks.
Live Dashboard: View personal appointments and health status.
2. Receptionist / Staff Interface
Operational dashboard for hospital staff to manage on-ground resources.

Bed Management: Update real-time availability of ICU, General, and Cardiac beds.
Counter Console: Manage patient queues, call next tokens, and mark visits as completed.
Blood Bank Control: Update blood stock levels (A+, B-, O+, etc.) instantly.
3. Administrator Interface
Strategic overview for hospital administrators.

Analytics: View system-wide metrics.
User Management: Manage staff accounts and permissions.
4. Authentication & Security
Supabase Auth: Secure email/password login and registration.
Role-Based Access Control (RBAC): Protected routes ensure patients cannot access staff controls and vice versa.
Profiles Table: Links authentication data to application-specific user roles (patient, receptionist, admin, doctor).
📊 Database Schema (Supabase)
hospitals
Stores facility locations and live resource counts.

id: UUID (Primary Key)
name, address, contact: Basic info
lat, lng: Geolocation coordinates
icu_total, icu_available: Critical care capacity
general_total, general_available: Standard ward capacity
cardiac_total, cardiac_available: Specialized cardiac care capacity
blood_banks
Tracks blood inventory.

id: UUID
name, city, lat, lng: Location info
stock: JSONB object storing counts for each blood group (e.g., {"A+": 10, "O-": 2})
tokens
Manages the OPD queue system.

number: Token display number (e.g., "A-12")
patient_name: Name of the patient
status: waiting | called | completed | cancelled
severity: normal | priority | emergency
profiles
Extends Supabase Auth with custom user data.

id: References auth.users
role: patient | receptionist | admin | doctor
full_name, avatar_url: Display info
🔄 Emergency Logic (The "Brain")
The EmergencyRedirect module (frontend/pages/EmergencyRedirect.tsx) is the system's most crucial feature. It:

Fetches all hospitals from Supabase.
Calculates Distances from the user's selected location to all facilities.
Filters hospitals that have valid availability for the specific required bed type (ICU/Cardiac/General).
Ranks them by proximity using a distance algorithm.
Directs the user to the best facility with turn-by-turn navigation link.
