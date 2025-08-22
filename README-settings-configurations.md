# 🎛️ Sistema de Configuraciones - TuriGest

## 📋 Descripción General

El Sistema de Configuraciones de TuriGest permite administrar configuraciones clave-valor del sistema de manera flexible y escalable. Esta funcionalidad reemplaza la pestaña de "Usuarios" en el módulo de Settings, proporcionando una interfaz moderna para gestionar diferentes tipos de configuraciones del sistema.

## 🏗️ Arquitectura de la Base de Datos

### Tabla `settings`

```sql
CREATE TABLE public.settings (
  id SERIAL NOT NULL,
  tenant_id INTEGER NULL,
  key TEXT NOT NULL,
  description TEXT NULL,
  config_type TEXT NOT NULL CHECK (config_type IN ('simple_list', 'colored_list')),
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  CONSTRAINT settings_pkey PRIMARY KEY (id),
  CONSTRAINT settings_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants (id)
);
```

### Campos Principales

- **`id`**: Identificador único autoincremental
- **`tenant_id`**: ID del tenant (NULL para configuraciones globales)
- **`key`**: Clave única de la configuración (ej: `reservation_statuses`)
- **`description`**: Descripción humana de la configuración
- **`config_type`**: Tipo de configuración (`simple_list` o `colored_list`)
- **`value`**: Valor JSON de la configuración
- **`created_at`**: Fecha de creación
- **`updated_at`**: Fecha de última actualización

## 🔧 Tipos de Configuración

### 1. Lista Simple (`simple_list`)
Configuraciones que almacenan arrays de strings simples.

**Ejemplo:**
```json
{
  "key": "property_types",
  "description": "Tipos de propiedad disponibles",
  "config_type": "simple_list",
  "value": ["Apartamento", "Casa", "Villa", "Cabaña", "Loft", "Estudio"]
}
```

### 2. Lista con Colores (`colored_list`)
Configuraciones que almacenan arrays de objetos con nombre y color.

**Ejemplo:**
```json
{
  "key": "reservation_statuses",
  "description": "Estados y colores de reservas",
  "config_type": "colored_list",
  "value": [
    {"name": "Pendiente", "color": "#fbbf24"},
    {"name": "Confirmada", "color": "#34d399"},
    {"name": "Cancelada", "color": "#f87171"},
    {"name": "Completada", "color": "#60a5fa"}
  ]
}
```

## 🚀 Funcionalidades Implementadas

### ✅ Gestión de Configuraciones
- **Crear**: Nueva configuración con clave, descripción y tipo
- **Editar**: Modificar configuraciones existentes
- **Eliminar**: Eliminar configuraciones del sistema
- **Listar**: Vista tabular de todas las configuraciones

### ✅ Gestión de Elementos
- **Agregar**: Nuevos elementos a listas existentes
- **Editar**: Modificar elementos individuales
- **Eliminar**: Eliminar elementos de las listas
- **Vista JSON**: Visualización en tiempo real del contenido JSON

### ✅ Interfaz de Usuario
- **Diseño Responsivo**: Adaptable a diferentes tamaños de pantalla
- **Pestañas Organizadas**: Separación clara por funcionalidad
- **Iconografía Intuitiva**: Iconos para cada tipo de configuración
- **Validación en Tiempo Real**: Verificación de datos antes de guardar

## 🎨 Componentes Principales

### 1. `SettingsConfigurations.tsx`
Componente principal que gestiona la lista de configuraciones y el formulario de creación/edición.

**Características:**
- Tabla de configuraciones con acciones CRUD
- Formulario modal para crear/editar configuraciones
- Filtrado por tipo de configuración
- Indicadores visuales de estado

### 2. `ConfigItemsManager.tsx`
Componente avanzado para gestionar elementos individuales de configuración.

**Características:**
- Vista dividida: campos editables + vista JSON
- Formulario para agregar/editar elementos
- Lista de elementos con acciones individuales
- Vista JSON en tiempo real
- Soporte para colores en configuraciones de tipo `colored_list`

## 📁 Estructura de Archivos

```
components/
├── SettingsConfigurations.tsx    # Gestión principal de configuraciones
├── ConfigItemsManager.tsx        # Gestión de elementos individuales
└── Settings.tsx                  # Componente principal de Settings (modificado)

types/
└── settings.ts                   # Tipos TypeScript para configuraciones

lib/
└── settings.ts                   # Funciones de acceso a Supabase

scripts/
└── 58-create-settings-table.sql # Script SQL para crear la tabla
```

## 🔌 Integración con Supabase

### Funciones Principales
- `getSettings()`: Obtener todas las configuraciones
- `getSettingByKey(key)`: Obtener configuración por clave
- `createSetting(data)`: Crear nueva configuración
- `updateSetting(id, data)`: Actualizar configuración existente
- `deleteSetting(id)`: Eliminar configuración
- `getSettingsByType(type)`: Filtrar por tipo de configuración

### Seguridad
- **RLS (Row Level Security)**: Implementado para control de acceso por tenant
- **Validación**: Verificación de tipos y formatos antes de guardar
- **Auditoría**: Timestamps automáticos de creación y modificación

## 🎯 Casos de Uso

### 1. Estados de Reserva
```json
{
  "key": "reservation_statuses",
  "description": "Estados y colores de reservas",
  "config_type": "colored_list",
  "value": [
    {"name": "Pendiente", "color": "#fbbf24"},
    {"name": "Confirmada", "color": "#34d399"},
    {"name": "Cancelada", "color": "#f87171"},
    {"name": "Completada", "color": "#60a5fa"}
  ]
}
```

### 2. Tipos de Propiedad
```json
{
  "key": "property_types",
  "description": "Tipos de propiedad disponibles",
  "config_type": "simple_list",
  "value": ["Apartamento", "Casa", "Villa", "Cabaña", "Loft", "Estudio"]
}
```

### 3. Servicios Incluidos
```json
{
  "key": "included_services",
  "description": "Servicios incluidos en las reservas",
  "config_type": "simple_list",
  "value": ["WiFi", "Limpieza", "Toallas", "Sábanas", "Cocina equipada", "Estacionamiento"]
}
```

## 🚀 Instalación y Configuración

### 1. Ejecutar Script SQL
```bash
# Ejecutar el script de creación de tabla
psql -d your_database -f scripts/58-create-settings-table.sql
```

### 2. Verificar Dependencias
```bash
npm install
npm run build
```

### 3. Acceder a la Funcionalidad
- Navegar a `/settings`
- Seleccionar la pestaña "Configuraciones"
- Comenzar a crear configuraciones del sistema

## 🔧 Personalización

### Agregar Nuevos Tipos de Configuración
1. Modificar el tipo `ConfigType` en `types/settings.ts`
2. Actualizar la validación en `lib/settings.ts`
3. Agregar iconos y etiquetas en los componentes

### Extender Funcionalidades
- **Validación Avanzada**: Agregar reglas de validación específicas
- **Import/Export**: Funcionalidad para respaldar configuraciones
- **Historial de Cambios**: Auditoría detallada de modificaciones
- **Plantillas**: Configuraciones predefinidas para diferentes tipos de negocio

## 🐛 Solución de Problemas

### Error: "No se pudieron cargar las configuraciones"
- Verificar conexión a Supabase
- Comprobar permisos RLS en la tabla `settings`
- Revisar logs del navegador para errores específicos

### Error: "No se pudo guardar la configuración"
- Verificar que la clave sea única
- Comprobar formato del JSON en el campo `value`
- Validar permisos de escritura en la base de datos

## 📈 Roadmap Futuro

### Versión 1.1
- [ ] Import/Export de configuraciones
- [ ] Plantillas predefinidas
- [ ] Búsqueda y filtrado avanzado

### Versión 1.2
- [ ] Historial de cambios
- [ ] Validación de esquemas JSON
- [ ] API REST para integraciones externas

### Versión 1.3
- [ ] Configuraciones condicionales
- [ ] Herencia de configuraciones por tenant
- [ ] Dashboard de métricas de uso

## 🤝 Contribución

Para contribuir al desarrollo de esta funcionalidad:

1. Crear una rama feature: `git checkout -b feature/settings-enhancement`
2. Implementar cambios siguiendo las convenciones del proyecto
3. Ejecutar tests: `npm run build && npm run dev`
4. Crear pull request con descripción detallada

## 📞 Soporte

Para reportar bugs o solicitar nuevas funcionalidades:

- **Issues**: Crear issue en el repositorio de GitHub
- **Documentación**: Revisar este README y la documentación del código
- **Desarrollo**: Contactar al equipo de desarrollo

---

**Desarrollado con ❤️ para TuriGest**
