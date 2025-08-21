# 🔐 Guía de Restauración de Seguridad - Base de Datos TuriGest

## 📋 Resumen del Problema

Se identificaron dos problemas críticos de seguridad:

1. **❌ Tabla `users` con RLS deshabilitado** - Los usuarios pueden acceder a perfiles de otros usuarios
2. **🔄 Bucle infinito en `bookings`** - Políticas RLS complejas causan problemas de rendimiento
3. **💳 Módulo `payments` sin multi-tenant** - Los pagos no están separados por organización

## 🚨 Estado Actual (INSECURO)

- La tabla `users` tiene RLS deshabilitado temporalmente
- Las políticas de `bookings` usan consultas EXISTS que causan bucles
- Los usuarios pueden ver/editar perfiles de otros usuarios
- **CRÍTICO**: La aplicación no es segura para producción
- **CRÍTICO**: Los pagos no están separados por tenant

## 🛠️ Solución: Restauración Completa de Seguridad

### **Paso 1: Restaurar Seguridad de la Tabla `users`**

```sql
-- Ejecutar en Supabase SQL Editor
\i scripts/47-restore-users-rls-security.sql
```

**¿Qué hace este script?**
- ✅ Habilita RLS en la tabla `users`
- ✅ Crea políticas restrictivas para cada operación
- ✅ Usuarios solo pueden acceder a su propio perfil
- ✅ El sistema puede crear/eliminar perfiles via triggers

**Políticas creadas:**
- `Users can view own profile` - Solo ver perfil propio
- `Users can update own profile` - Solo actualizar perfil propio  
- `System can insert user profiles` - Sistema crea perfiles
- `System can delete user profiles` - Sistema elimina perfiles (bloqueado para usuarios)

### **Paso 2: Corregir Bucle Infinito en `bookings`**

```sql
-- Ejecutar en Supabase SQL Editor
\i scripts/50-fix-bookings-infinite-loop.sql
```

**¿Qué hace este script?**
- ✅ Elimina políticas complejas con EXISTS/JOIN
- ✅ Crea políticas simples basadas en `tenant_id`
- ✅ Evita consultas circulares que causan bucles
- ✅ Mantiene separación multi-tenant

**Políticas simplificadas:**
- `Users can view bookings for their tenant` - Ver reservas del tenant
- `Users can insert bookings for their tenant` - Crear reservas en el tenant
- `Users can update bookings for their tenant` - Actualizar reservas del tenant
- `Users can delete bookings for their tenant` - Eliminar reservas del tenant

### **Paso 3: Implementar Multi-Tenant en `payments`**

```sql
-- Ejecutar en Supabase SQL Editor
\i scripts/52-add-tenant-to-payments.sql
```

**¿Qué hace este script?**
- ✅ Agrega columna `tenant_id` a la tabla `payments`
- ✅ Migra datos existentes basándose en reservas → propiedades → tenant
- ✅ Habilita RLS con políticas multi-tenant
- ✅ Crea índices para optimizar consultas por tenant

**Políticas creadas:**
- `Users can view payments for their tenant` - Ver pagos del tenant
- `Users can insert payments for their tenant` - Crear pagos en el tenant
- `Users can update payments for their tenant` - Actualizar pagos del tenant
- `Users can delete payments for their tenant` - Eliminar pagos del tenant

### **Paso 4: Verificar la Restauración**

```sql
-- Ejecutar en Supabase SQL Editor
\i scripts/48-verify-users-security.sql
\i scripts/53-verify-payments-tenant.sql
\i scripts/55-final-payments-verification.sql
```

**¿Qué verifican estos scripts?**
- ✅ RLS habilitado en todas las tablas críticas
- ✅ Políticas RLS creadas correctamente
- ✅ Multi-tenant implementado en todas las tablas (INCLUYENDO PAYMENTS)
- ✅ No hay políticas demasiado permisivas

## 🔍 Verificación Manual

### **1. Verificar RLS en `users`**
```sql
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'users';
```

**Resultado esperado:**
```
schemaname | tablename | rls_enabled
-----------+-----------+-------------
public     | users     | true
```

### **2. Verificar Políticas en `users`**
```sql
SELECT 
    policyname,
    cmd as operation,
    qual as using_condition
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'users'
ORDER BY cmd;
```

**Resultado esperado:**
```
policyname                    | operation | using_condition
------------------------------+-----------+------------------
Users can view own profile    | SELECT    | auth.uid() = id
Users can update own profile  | UPDATE    | auth.uid() = id
System can insert user profiles| INSERT    | auth.uid() = id
System can delete user profiles| DELETE    | false
```

### **3. Verificar RLS en `bookings`**
```sql
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'bookings';
```

**Resultado esperado:**
```
schemaname | tablename | rls_enabled
-----------+-----------+-------------
public     | bookings | true
```

### **4. Verificar Políticas en `bookings`**
```sql
SELECT 
    policyname,
    cmd as operation,
    qual as using_condition
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'bookings'
ORDER BY cmd;
```

**Resultado esperado:**
```
policyname                              | operation | using_condition
----------------------------------------+-----------+------------------
Users can view bookings for their tenant | SELECT    | tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
Users can insert bookings for their tenant| INSERT    | tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
Users can update bookings for their tenant| UPDATE    | tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
Users can delete bookings for their tenant| DELETE    | tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
```

### **5. Verificar RLS en `payments`**
```sql
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'payments';
```

**Resultado esperado:**
```
schemaname | tablename | rls_enabled
-----------+-----------+-------------
public     | payments | true
```

### **6. Verificar Políticas en `payments`**
```sql
SELECT 
    policyname,
    cmd as operation,
    qual as using_condition
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'payments'
ORDER BY cmd;
```

**Resultado esperado:**
```
policyname                              | operation | using_condition
----------------------------------------+-----------+------------------
Users can view payments for their tenant | SELECT    | tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
Users can insert payments for their tenant| INSERT    | tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
Users can update payments for their tenant| UPDATE    | tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
Users can delete payments for their tenant| DELETE    | tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
```

## 🚨 Rollback de Emergencia

Si algo sale mal y la aplicación deja de funcionar:

```sql
-- SOLO EN CASO DE EMERGENCIA
\i scripts/49-rollback-users-security.sql
\i scripts/54-rollback-payments-tenant.sql
```

**⚠️ ADVERTENCIA:** Estos scripts deshabilitan TODA la seguridad de las tablas `users` y `payments`

## 📊 Estado Después de la Restauración

### **✅ Seguridad Restaurada**
- [x] RLS habilitado en `users`
- [x] Políticas restrictivas en `users`
- [x] RLS habilitado en `bookings`
- [x] Políticas simplificadas en `bookings`
- [x] RLS habilitado en `payments`
- [x] Políticas multi-tenant en `payments`
- [x] Multi-tenant en todas las tablas críticas
- [x] No hay bucles infinitos

### **🔒 Niveles de Acceso**
- **Usuarios autenticados**: Solo pueden acceder a su propio perfil
- **Propiedades**: Solo pueden ver/editar propiedades de su tenant
- **Reservas**: Solo pueden ver/editar reservas de su tenant
- **Personas**: Solo pueden ver/editar personas de su tenant
- **Documentos**: Solo pueden ver/editar documentos de su tenant
- **Gastos**: Solo pueden ver/editar gastos de su tenant
- **Pagos**: Solo pueden ver/editar pagos de su tenant

## 🧪 Testing Post-Restauración

### **1. Test de Autenticación**
- [ ] Usuario puede iniciar sesión
- [ ] Usuario puede ver su perfil
- [ ] Usuario NO puede ver perfiles de otros usuarios

### **2. Test de Multi-Tenant**
- [ ] Usuario solo ve propiedades de su tenant
- [ ] Usuario solo ve reservas de su tenant
- [ ] Usuario solo ve personas de su tenant
- [ ] Usuario solo ve documentos de su tenant
- [ ] Usuario solo ve gastos de su tenant
- [ ] Usuario solo ve pagos de su tenant

### **3. Test de Rendimiento**
- [ ] No hay bucles infinitos en `bookings`
- [ ] Las consultas son rápidas
- [ ] No hay timeouts en `getUserProfile`
- [ ] Los pagos se cargan correctamente por tenant

## 📝 Logs de Verificación

### **Logs Esperados en Consola:**
```
✅ RLS RESTAURADO EXITOSAMENTE en la tabla users
✅ Políticas completas: SELECT, INSERT, UPDATE, DELETE
✅ Todas las políticas son simples (sin EXISTS/JOIN)
✅ MULTI-TENANT PAYMENTS IMPLEMENTADO EXITOSAMENTE
🎉 SEGURIDAD COMPLETA: Todas las tablas críticas están protegidas (INCLUYENDO PAYMENTS)
```

### **Logs de Error (NO esperados):**
```
❌ RLS no se pudo habilitar en la tabla users
❌ Políticas incompletas
⚠️ ADVERTENCIA: Algunas políticas son demasiado permisivas
❌ MULTI-TENANT PAYMENTS NO implementado correctamente
```

## 🔄 Orden de Ejecución

1. **Ejecutar** `47-restore-users-rls-security.sql` - Restaura seguridad de users
2. **Ejecutar** `50-fix-bookings-infinite-loop.sql` - Corrige bucles en bookings
3. **Ejecutar** `52-add-tenant-to-payments.sql` - Implementa multi-tenant en payments
4. **Verificar** `48-verify-users-security.sql` - Confirma seguridad de users
5. **Verificar** `53-verify-payments-tenant.sql` - Confirma multi-tenant de payments
6. **Verificar** `55-final-payments-verification.sql` - Verificación completa
7. **Testear** la aplicación en local
8. **Confirmar** que no hay errores de seguridad

## ⚠️ Consideraciones Importantes

### **Antes de Ejecutar:**
- ✅ Hacer backup de la base de datos
- ✅ Ejecutar en horario de bajo tráfico
- ✅ Tener scripts de rollback listos
- ✅ Probar en staging primero

### **Después de Ejecutar:**
- ✅ Verificar que la aplicación funciona
- ✅ Confirmar que los usuarios solo ven sus datos
- ✅ Verificar que los pagos están separados por tenant
- ✅ Monitorear logs por errores
- ✅ Verificar rendimiento de consultas

## 🆘 Contacto de Emergencia

Si algo sale mal:
1. **Ejecutar rollback**: `49-rollback-users-security.sql` y `54-rollback-payments-tenant.sql`
2. **Verificar estado**: `48-verify-users-security.sql` y `53-verify-payments-tenant.sql`
3. **Revisar logs** de la aplicación
4. **Contactar** al equipo de desarrollo

---

**🎯 Objetivo Final:** Restaurar la seguridad completa de la base de datos manteniendo la funcionalidad multi-tenant, eliminando los bucles infinitos, e implementando separación de pagos por organización.
