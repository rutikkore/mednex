-- 1. Add last_updated_at column to hospitals and blood_banks if they don't exist
ALTER TABLE public.hospitals 
ADD COLUMN IF NOT EXISTS last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

ALTER TABLE public.blood_banks 
ADD COLUMN IF NOT EXISTS last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 2. Create the generic trigger function to auto-update last_updated_at
CREATE OR REPLACE FUNCTION public.update_last_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. Attach trigger to hospitals table
DROP TRIGGER IF EXISTS update_hospitals_last_updated ON public.hospitals;
CREATE TRIGGER update_hospitals_last_updated
    BEFORE UPDATE ON public.hospitals
    FOR EACH ROW
    EXECUTE PROCEDURE public.update_last_updated_at_column();

-- 4. Attach trigger to blood_banks table
DROP TRIGGER IF EXISTS update_blood_banks_last_updated ON public.blood_banks;
CREATE TRIGGER update_blood_banks_last_updated
    BEFORE UPDATE ON public.blood_banks
    FOR EACH ROW
    EXECUTE PROCEDURE public.update_last_updated_at_column();
