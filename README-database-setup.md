# Configuración de Base de Datos para Configuraciones del Sistema

## 🚨 IMPORTANTE: Configurar la Base de Datos Primero

Antes de usar la funcionalidad de configuraciones del sistema, **DEBES ejecutar los scripts SQL** para crear la tabla y habilitar las políticas de seguridad.

## 📋 Scripts Disponibles

### 1. Script Completo (Recomendado)
**Archivo:** `scripts/60-complete-settings-setup.sql`

Este script hace todo en una sola ejecución:
- ✅ Crea la tabla `settings`
- ✅ Crea índices y triggers
- ✅ Inserta datos de ejemplo
- ✅ Habilita Row Level Security (RLS)
- ✅ Crea todas las políticas de seguridad
- ✅ Incluye verificaciones automáticas

### 2. Scripts Separados
Si prefieres ejecutar paso a paso:

- **`scripts/58-create-settings-table.sql`**: Solo crea la tabla y datos
- **`scripts/59-enable-settings-rls.sql`**: Solo habilita RLS y políticas

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

### Políticas Implementadas:
1. **SELECT**: Usuarios pueden ver configuraciones globales y de su tenant
2. **INSERT**: Usuarios pueden crear configuraciones para su tenant o globales
3. **UPDATE**: Usuarios solo pueden actualizar configuraciones de su tenant
4. **DELETE**: Usuarios solo pueden eliminar configuraciones de su tenant

### Seguridad por Tenant:
- Cada usuario solo ve configuraciones de su organización
- Las configuraciones globales (`tenant_id = NULL`) son visibles para todos
- No hay acceso cruzado entre tenants

## 🚀 Cómo Ejecutar

### Opción 1: Script Completo (Recomendado)
```sql
-- En tu cliente SQL (pgAdmin, DBeaver, etc.)
-- Ejecutar el contenido de: scripts/60-complete-settings-setup.sql
```

### Opción 2: Desde la Línea de Comandos
```bash
# Conectarse a tu base de datos Supabase
psql "postgresql://postgres:[password]@[host]:5432/postgres"

# Ejecutar el script
\i scripts/60-complete-settings-setup.sql
```

### Opción 3: Desde Supabase Dashboard
1. Ir a **SQL Editor** en tu proyecto Supabase
2. Copiar y pegar el contenido del script
3. Ejecutar la consulta

## ✅ Verificaciones Post-Ejecución

Después de ejecutar el script, deberías ver:

### 1. Tabla Creada
```sql
SELECT COUNT(*) FROM public.settings;
-- Debería mostrar 4 configuraciones de ejemplo
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
- **Solución**: Ejecutar `scripts/60-complete-settings-setup.sql`

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

## 🎉 ¡Listo!

Una vez ejecutado el script SQL, la funcionalidad de configuraciones estará completamente operativa con:
- ✅ Seguridad por tenant
- ✅ Políticas RLS activas
- ✅ Datos de ejemplo cargados
- ✅ Interfaz de usuario funcional
