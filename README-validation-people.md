# Validación de Personas en Reservas

Este conjunto de scripts valida que todas las personas referenciadas en las reservas existan en la base de datos de personas (tabla `people`).

## 📋 Problema a Resolver

Las reservas pueden tener:
1. **`person_id` válido**: Referencia a una persona existente en la tabla `people`
2. **`person_id` inválido**: Referencia a una persona que no existe en la tabla `people`
3. **Sin `person_id`**: Reserva sin vincular a ninguna persona (puede ser normal)

## 🛠️ Scripts Disponibles

### 1. Script SQL Completo (`65-validate-reservation-people.sql`)
- **Función**: Validación completa con funciones SQL
- **Uso**: Ejecutar en Supabase SQL Editor
- **Características**:
  - Funciones SQL reutilizables
  - Reportes detallados
  - Estadísticas completas
  - Consultas de limpieza

### 2. Script SQL Simple (`66-simple-people-validation.sql`)
- **Función**: Validación rápida y simple
- **Uso**: Ejecutar en Supabase SQL Editor
- **Características**:
  - Consultas directas
  - Resultados inmediatos
  - Fácil de entender

### 3. Script Node.js (`validate-reservation-people.js`)
- **Función**: Validación desde la línea de comandos
- **Uso**: Ejecutar desde el terminal
- **Características**:
  - Interfaz amigable
  - Correcciones automáticas
  - Reportes coloreados

## 🚀 Uso de los Scripts

### Script Node.js (Recomendado)

```bash
# Validación completa (solo reporte)
node scripts/validate-reservation-people.js

# Solo estadísticas
node scripts/validate-reservation-people.js --stats-only

# Validación con correcciones automáticas
node scripts/validate-reservation-people.js --fix
```

### Scripts SQL

1. **Abrir Supabase SQL Editor**
2. **Copiar y pegar** el contenido del script
3. **Ejecutar** las consultas

## 📊 Interpretación de Resultados

### Estados de Validación

| Estado | Descripción | Acción Requerida |
|--------|-------------|------------------|
| **OK** | Persona correctamente vinculada | ✅ Ninguna |
| **WARNING** | Reserva sin `person_id` | ⚠️ Considerar vincular si es necesario |
| **ERROR** | `person_id` referenciado no existe | ❌ Corregir o crear persona |

### Estadísticas

- **Total de reservas**: Número total de reservas en el sistema
- **Con person_id**: Reservas que tienen un `person_id` asignado
- **Sin person_id**: Reservas sin `person_id` (puede ser normal)
- **Person_id válidos**: Referencias que apuntan a personas existentes
- **Person_id inválidos**: Referencias que apuntan a personas inexistentes
- **Porcentaje de validación**: Porcentaje de `person_id` válidos

## 🔧 Correcciones Automáticas

### Person_id Inválidos
- **Problema**: `person_id` que no existe en la tabla `people`
- **Solución**: Se establece `person_id` a `NULL`

### Vinculaciones Automáticas
- **Problema**: Reservas sin `person_id` pero con email que coincide con una persona
- **Solución**: Se asigna el `person_id` correspondiente

## 📝 Ejemplos de Uso

### Ejemplo 1: Validación Básica
```bash
node scripts/validate-reservation-people.js
```

**Salida:**
```
============================================================
VALIDACIÓN DE PERSONAS EN RESERVAS
============================================================

📋 Estadísticas Generales
----------------------------------------
📊 Total de reservas: 150
🔗 Con person_id: 120
⚠️  Sin person_id: 30
✅ Person_id válidos: 115
❌ Person_id inválidos: 5
📈 Porcentaje de validación: 95.83%
```

### Ejemplo 2: Corrección Automática
```bash
node scripts/validate-reservation-people.js --fix
```

**Salida:**
```
🔧 Corrigiendo 5 person_id inválidos...
✅ Corregido: 123e4567-e89b-12d3-a456-426614174000 (Juan Pérez)
✅ Corregido: 987fcdeb-51a2-43d1-9f12-345678901234 (María García)

🔗 Vinculando 3 reservas automáticamente...
✅ Vinculado: 456e7890-e89b-12d3-a456-426614174000 → 789abcde-51a2-43d1-9f12-345678901234 (Ana López)
```

## ⚠️ Consideraciones Importantes

### Antes de Ejecutar Correcciones
1. **Hacer backup** de la base de datos
2. **Revisar** los resultados de validación
3. **Verificar** que las vinculaciones automáticas son correctas

### Person_id Inválidos
- Se establecen a `NULL` para evitar referencias rotas
- La información del huésped se mantiene en el campo `guest` (JSONB)
- Se puede vincular manualmente después

### Vinculaciones Automáticas
- Solo se vinculan por **email exacto**
- Se verifica que el email no esté vacío
- Se mantiene la información original en el campo `guest`

## 🔍 Troubleshooting

### Error: Variables de entorno no configuradas
```bash
❌ Error: Variables de entorno de Supabase no configuradas
```
**Solución**: Verificar que `.env.local` tenga:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Error: Permisos insuficientes
```bash
❌ Error obteniendo estadísticas: permission denied
```
**Solución**: Usar `SUPABASE_SERVICE_ROLE_KEY` en lugar de la clave anónima

### Error: Tabla no encontrada
```bash
❌ Error: relation "reservations" does not exist
```
**Solución**: Verificar que las tablas `reservations` y `people` existan

## 📚 Estructura de la Base de Datos

### Tabla `reservations`
```sql
CREATE TABLE public.reservations (
  id uuid PRIMARY KEY,
  guest jsonb NOT NULL,           -- Información del huésped
  person_id uuid,                 -- Referencia a people.id (puede ser NULL)
  -- ... otros campos
);
```

### Tabla `people`
```sql
CREATE TABLE public.people (
  id uuid PRIMARY KEY,
  first_name text,
  last_name text,
  email text,
  -- ... otros campos
);
```

## 🎯 Objetivos de la Validación

1. **Integridad de datos**: Asegurar que todas las referencias sean válidas
2. **Consistencia**: Mantener la coherencia entre reservas y personas
3. **Limpieza**: Identificar y corregir datos inconsistentes
4. **Automatización**: Facilitar la vinculación automática cuando sea posible

## 📞 Soporte

Si encuentras problemas o necesitas ayuda:
1. Revisar los logs de error
2. Verificar la configuración de la base de datos
3. Consultar la documentación de Supabase
4. Revisar los permisos de RLS (Row Level Security)

