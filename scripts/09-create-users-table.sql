-- Create users table
CREATE TABLE public.users (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['admin'::text, 'manager'::text, 'operator'::text, 'viewer'::text])),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_login timestamp with time zone,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Usuario'),
    COALESCE(new.raw_user_meta_data->>'role', 'viewer')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample users (optional)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES 
  (
    gen_random_uuid(),
    'admin@pms.com',
    crypt('admin123456', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"full_name": "Administrador", "role": "admin"}'::jsonb
  ),
  (
    gen_random_uuid(),
    'manager@pms.com',
    crypt('manager123456', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"full_name": "Manager", "role": "manager"}'::jsonb
  ),
  (
    gen_random_uuid(),
    'operator@pms.com',
    crypt('operator123456', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"full_name": "Operador", "role": "operator"}'::jsonb
  ),
  (
    gen_random_uuid(),
    'viewer@pms.com',
    crypt('viewer123456', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"full_name": "Visualizador", "role": "viewer"}'::jsonb
  )
ON CONFLICT (email) DO NOTHING; 