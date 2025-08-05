-- Script para corregir las políticas RLS de la tabla users
-- El problema es que las políticas actuales causan recursión infinita

-- 1. Eliminar las políticas problemáticas de users
DROP POLICY IF EXISTS "Admins can delete users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;

-- 2. Crear políticas simples para aplicación single-tenant
-- Para aplicación single-tenant, todos los usuarios autenticados pueden acceder a todo
CREATE POLICY "Authenticated users can access everything" ON users FOR ALL TO authenticated USING (true);

-- 3. Alternativa más restrictiva (si prefieres control de roles):
-- CREATE POLICY "Users can view all users" ON users FOR SELECT TO authenticated USING (true);
-- CREATE POLICY "Users can update own profile" ON users FOR UPDATE TO authenticated USING (auth.uid() = id);
-- CREATE POLICY "Admins can manage all users" ON users FOR ALL TO authenticated USING (
--   EXISTS (
--     SELECT 1 FROM users u 
--     WHERE u.id = auth.uid() 
--     AND u.role = 'admin'
--   )
-- );

-- Comentario explicativo
COMMENT ON POLICY "Authenticated users can access everything" ON users IS 'Política RLS para aplicación single-tenant - acceso total para usuarios autenticados'; 