-- SEED DATA FOR HOSPITALS
INSERT INTO public.hospitals (name, lat, lng, address, contact, icu_total, icu_available, general_total, general_available, cardiac_total, cardiac_available) VALUES
('Tata Memorial Hospital', 19.0040, 72.8436, 'Dr. E, Ernest Borges Rd, Parel, Mumbai, Maharashtra 400012', '022-24177000', 60, 0, 400, 15, 30, 0),
('KEM Hospital', 19.0025, 72.8425, 'Acharya Donde Marg, Parel, Mumbai, Maharashtra 400012', '022-24107000', 80, 5, 1800, 42, 40, 3),
('Lilavati Hospital & Research Centre', 19.0514, 72.8285, 'A-791, Bandra Reclamation Rd, Bandra West, Mumbai, Maharashtra 400050', '022-26751000', 50, 12, 323, 58, 35, 8),
('Nanavati Max Super Speciality Hospital', 19.1002, 72.8358, 'S.V. Road, Vile Parle West, Mumbai, Maharashtra 400056', '022-26267500', 75, 10, 350, 45, 25, 5),
('Sir H. N. Reliance Foundation Hospital', 18.9587, 72.8202, 'Raja Rammohan Roy Rd, Prarthana Samaj, Girgaon, Mumbai, Maharashtra 400004', '022-61306130', 100, 18, 345, 112, 50, 14);

-- SEED DATA FOR BLOOD BANKS
INSERT INTO public.blood_banks (name, lat, lng, city, stock) VALUES
('Arpan Blood Bank', 19.0433, 72.8231, 'Mumbai', '{"A+": 30, "A-": 10, "B+": 25, "B-": 5, "O+": 0, "O-": 8, "AB+": 12, "AB-": 4}'),
('Samarpan Blood Bank', 19.1176, 72.8485, 'Mumbai', '{"A+": 15, "A-": 5, "B+": 20, "B-": 2, "O+": 35, "O-": 4, "AB+": 10, "AB-": 2}'),
('Think Foundation', 18.9402, 72.8352, 'Mumbai', '{"A+": 12, "A-": 2, "B+": 18, "B-": 1, "O+": 22, "O-": 0, "AB+": 6, "AB-": 1}');

-- SEED DATA FOR TOKENS (Optional, usually dynamic)
INSERT INTO public.tokens (number, patient_name, service, severity, status, eta) VALUES
('A-102', 'Rahul Sharma', 'Cardiology', 'normal', 'waiting', '12m'),
('A-103', 'Priya Singh', 'General Medicine', 'priority', 'called', 'Now'),
('E-001', 'Emergency Case', 'Trauma', 'emergency', 'waiting', '2m');
