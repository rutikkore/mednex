-- Step 5: Blood Bank Transfer System Migration

-- 1. Create the transfer requests table linking two blood banks together
CREATE TABLE IF NOT EXISTS public.blood_transfer_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_bank_id UUID NOT NULL REFERENCES public.blood_banks(id) ON DELETE CASCADE,
    supplier_bank_id UUID NOT NULL REFERENCES public.blood_banks(id) ON DELETE CASCADE,
    blood_type TEXT NOT NULL,
    units INTEGER NOT NULL CHECK (units > 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'in_transit', 'delivered')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1.5 Add explicit tracking to blood banks table
ALTER TABLE public.blood_banks ADD COLUMN IF NOT EXISTS inventory_details JSONB DEFAULT '[]'::jsonb;

-- 2. Enable Realtime updates for the new table so the UI can sync live
ALTER PUBLICATION supabase_realtime ADD TABLE public.blood_transfer_requests;

-- 3. Row Level Security (RLS) Policies
ALTER TABLE public.blood_transfer_requests ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all transfer requests
CREATE POLICY "Users can read all transfer requests" 
    ON public.blood_transfer_requests FOR SELECT 
    USING (auth.role() = 'authenticated');

-- Allow authenticated users to create transfer requests
CREATE POLICY "Users can insert transfer requests" 
    ON public.blood_transfer_requests FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update transfer requests (e.g. marking approved)
CREATE POLICY "Users can update transfer requests" 
    ON public.blood_transfer_requests FOR UPDATE 
    WITH CHECK (auth.role() = 'authenticated');

-- 4. Auto-update Trigger for updated_at
CREATE OR REPLACE FUNCTION update_transfer_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_timestamp_transfer_requests
    BEFORE UPDATE ON public.blood_transfer_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_transfer_timestamp();
