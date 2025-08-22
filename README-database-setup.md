# Configuración de Base de Datos para Configuraciones del Sistema

## 🚨 IMPORTANTE: Configurar la Base de Datos Primero

Antes de usar la funcionalidad de configuraciones del sistema, **DEBES ejecutar los scripts SQL** para crear la tabla y habilitar las políticas de seguridad.

## ⚠️ PROBLEMA CONOCIDO: Error de Permisos

Si encuentras este error:
```
permission denied for table users
```

**Causa**: Las políticas RLS complejas intentan acceder a `auth.users` o `public.users` para obtener el `tenant_id`, pero no tienen permisos.

**Solución**: Usar el script simplificado `scripts/63-complete-simple-settings-setup.sql` que evita este problema.

## ⚠️ PROBLEMA CONOCIDO: No se guardan nuevas claves

Si las nuevas claves que añades no se están guardando:

**Causa**: La tabla `settings` no existe o las políticas RLS no están configuradas correctamente.

**Solución**: Ejecutar `scripts/63-complete-simple-settings-setup.sql` que crea todo desde cero.

## 📋 Scripts Disponibles

### 1. Script Completo Simplificado (Recomendado para producción)
**Archivo:** `scripts/63-complete-simple-settings-setup.sql`

Este script hace todo en una sola ejecución y evita problemas:
- ✅ Crea la tabla `settings` desde cero
- ✅ Crea índices y triggers
- ✅ Inserta datos de ejemplo
- ✅ Habilita Row Level Security (RLS)
- ✅ Crea políticas RLS simplificadas y seguras
- ✅ Incluye verificaciones automáticas
- ✅ **NO tiene problemas de permisos**

### 2. Script de Prueba
**Archivo:** `scripts/64-test-settings-functionality.sql`

Este script verifica que todo funciona correctamente:
- ✅ Prueba la estructura de la tabla
- ✅ Verifica datos de ejemplo
- ✅ Comprueba RLS y políticas
- ✅ Prueba operaciones CRUD (crear, leer, actualizar, eliminar)

### 3. Scripts Separados (Para desarrollo avanzado)
- **`scripts/58-create-settings-table.sql`**: Solo crea la tabla y datos
- **`scripts/59-enable-settings-rls.sql`**: Solo habilita RLS y políticas (puede tener problemas de permisos)
- **`scripts/60-complete-settings-setup.sql`**: Script completo con políticas avanzadas
- **`scripts/61-fix-settings-rls-policies.sql`**: Corrige políticas existentes (experimental)
- **`scripts/62-simple-settings-rls.sql`**: Solo políticas RLS simplificadas

## 🗄️ Estructura de la Tabla

```sql
CREATE TABLE public.settings (
  id SERIAL NOT NULL,
  tenant_id INTEGER NULL,           -- NULL = configuración global
  key TEXT NOT NULL,                -- Clave única de configuración
  description TEXT NULL,            -- Descripción opcional
  config_type TEXT NOT NULL,        -- 'simple_list' o 'colored_list'
  value JSONB NOT NULL,             -- Valor de la configuración
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔐 Políticas de Seguridad (RLS)

### Políticas Simplificadas (Recomendadas):
1. **SELECT**: Usuarios autenticados pueden ver todas las configuraciones
2. **INSERT**: Usuarios autenticados pueden crear configuraciones
3. **UPDATE**: Usuarios autenticados pueden actualizar configuraciones
4. **DELETE**: Usuarios autenticados pueden eliminar configuraciones

### Políticas Avanzadas (Requieren tabla users con tenant_id):
1. **SELECT**: Usuarios pueden ver configuraciones globales y de su tenant
2. **INSERT**: Usuarios pueden crear configuraciones para su tenant o globales
3. **UPDATE**: Usuarios solo pueden actualizar configuraciones de su tenant
4. **DELETE**: Usuarios solo pueden eliminar configuraciones de su tenant

## 🚀 Cómo Ejecutar

### Opción 1: Script Simplificado (Recomendado para evitar problemas)
```sql
-- En tu cliente SQL (pgAdmin, DBeaver, etc.)
-- Ejecutar el contenido de: scripts/63-complete-simple-settings-setup.sql
```

### Opción 2: Verificar Funcionalidad
```sql
-- Después de ejecutar el script principal, ejecutar:
-- scripts/64-test-settings-functionality.sql
```

### Opción 3: Desde Supabase Dashboard
1. Ir a **SQL Editor** en tu proyecto Supabase
2. Copiar y pegar el contenido del script elegido
3. Ejecutar la consulta

## ✅ Verificaciones Post-Ejecución

Después de ejecutar el script, deberías ver:

### 1. Tabla Creada
```sql
SELECT COUNT(*) FROM public.settings;
-- Debería mostrar 4 configuraciones
```

### 2. RLS Habilitado
```sql
SELECT rowsecurity FROM pg_tables WHERE tablename = 'settings';
-- Debería mostrar 'true'
```

### 3. Políticas Creadas
```sql
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'settings';
-- Debería mostrar 4 políticas (SELECT, INSERT, UPDATE, DELETE)
```

## 🎯 Datos de Ejemplo Incluidos

El script crea automáticamente:

### Configuraciones con Colores (`colored_list`):
- **Estados de Reserva**: Pendiente, Confirmada, Cancelada, Completada
- **Métodos de Pago**: Tarjeta, Transferencia, Efectivo, PayPal

### Configuraciones Simples (`simple_list`):
- **Tipos de Propiedad**: Apartamento, Casa, Villa, Cabaña, Loft, Estudio
- **Servicios Incluidos**: WiFi, Limpieza, Toallas, Sábanas, Cocina, Estacionamiento

## 🔧 Personalización

### Agregar Nuevas Configuraciones:
```sql
INSERT INTO public.settings (key, description, config_type, value) VALUES
('nueva_config', 'Descripción', 'simple_list', '["valor1", "valor2"]');
```

### Modificar Configuraciones Existentes:
```sql
UPDATE public.settings 
SET value = '["nuevo_valor"]'::jsonb 
WHERE key = 'nueva_config';
```

## 🚨 Solución de Problemas

### Error: "Table does not exist"
- **Causa**: No se ejecutó el script SQL
- **Solución**: Ejecutar `scripts/63-complete-simple-settings-setup.sql`

### Error: "permission denied for table users"
- **Causa**: Las políticas RLS intentan acceder a tablas sin permisos
- **Solución**: Usar `scripts/63-complete-simple-settings-setup.sql` en su lugar

### Error: "No se guardan nuevas claves"
- **Causa**: Tabla no existe o RLS mal configurado
- **Solución**: Ejecutar `scripts/63-complete-simple-settings-setup.sql`

### Error: "Permission denied"
- **Causa**: RLS no está habilitado o las políticas no están creadas
- **Solución**: Verificar que RLS esté habilitado y las políticas existan

### Error: "Foreign key constraint"
- **Causa**: La tabla `tenants` no existe o no tiene datos
- **Solución**: Asegurar que la tabla `tenants` esté configurada

## 📞 Soporte

Si encuentras problemas:

1. **Verificar logs**: Revisar la consola del navegador para errores específicos
2. **Verificar base de datos**: Confirmar que la tabla `settings` existe
3. **Verificar RLS**: Confirmar que las políticas están activas
4. **Revisar permisos**: Verificar que el usuario tiene acceso a la tabla
5. **Usar script simplificado**: Si hay problemas, usar `63-complete-simple-settings-setup.sql`
6. **Ejecutar pruebas**: Usar `64-test-settings-functionality.sql` para diagnosticar

## 🎉 ¡Listo!

Una vez ejecutado el script SQL, la funcionalidad de configuraciones estará completamente operativa con:
- ✅ Seguridad básica por RLS
- ✅ Políticas RLS activas y funcionales
- ✅ Datos de ejemplo cargados
- ✅ Interfaz de usuario funcional
- ✅ Sin problemas de permisos
- ✅ **Nuevas claves se guardan correctamente**
