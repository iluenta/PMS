-- Script para corregir políticas RLS de la tabla users que causan timeout
-- Fecha: 2025-01-27
-- Descripción: Corregir políticas RLS que bloquean getUserProfile

-- 1. ELIMINAR POLÍTICAS RLS PROBLEMÁTICAS
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- 2. DESHABILITAR ROW LEVEL SECURITY TEMPORALMENTE
-- Esto permitirá que getUserProfile funcione mientras investigamos el problema
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 3. VERIFICAR QUE RLS ESTÁ DESHABILITADO
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'users';

-- 4. VERIFICAR QUE NO HAY POLÍTICAS RLS ACTIVAS
SELECT 
  schemaname,
  tablename,
  policyname
FROM pg_policies 
WHERE tablename = 'users';

-- NOTA: Después de ejecutar este script, getUserProfile debería funcionar
-- sin timeout. Una vez que confirmemos que funciona, podemos investigar
-- por qué las políticas RLS estaban causando problemas y recrearlas
-- de manera más robusta.
