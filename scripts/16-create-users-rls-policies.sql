-- RLS Policies for users table
-- This script creates the necessary policies to allow users to access their own records

-- Policy to allow users to SELECT their own profile
CREATE POLICY "Users can view own profile" 
ON public.users 
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Policy to allow users to UPDATE their own profile (for last_login updates)
CREATE POLICY "Users can update own profile" 
ON public.users 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- Note: If the users table doesn't exist, create it first:
-- CREATE TABLE IF NOT EXISTS public.users (
--   id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
--   email TEXT,
--   full_name TEXT,
--   role TEXT DEFAULT 'owner',
--   is_active BOOLEAN DEFAULT true,
--   last_login TIMESTAMPTZ,
--   created_at TIMESTAMPTZ DEFAULT NOW(),
--   updated_at TIMESTAMPTZ DEFAULT NOW()
-- );
-- 
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY; 