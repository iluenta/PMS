# 🏠 TuriGest PMS - Sistema de Gestión de Propiedades Turísticas

Un sistema completo de gestión de propiedades turísticas (PMS) construido con Next.js 15, TypeScript, Supabase y Shadcn UI.

## 🚀 Características

### 📊 Gestión Completa de Propiedades
- **Gestión de propiedades** con información detallada
- **Configuración de disponibilidad** y reglas de reserva
- **Gestión de imágenes** y comodidades
- **Configuración de precios** y tarifas

### 📅 Sistema de Reservas
- **Calendario interactivo** para visualizar reservas
- **Gestión de huéspedes** con información completa
- **Estados de reserva** (confirmada, pendiente, cancelada)
- **Fuentes de reserva** (Booking.com, Airbnb, directo, etc.)

### 💰 Gestión Financiera
- **Configuración de comisiones** por canal
- **Gestión de pagos** de reservas
- **Gastos de propiedades** con categorización
- **Reportes financieros** detallados

### 📋 Guías de Viajero
- **Gestión de guías** por propiedad
- **Secciones personalizables** (check-in, lugares, restaurantes)
- **Elementos dinámicos** con información local
- **Vista previa** de guías

### 📈 Reportes y Análisis
- **Dashboard** con métricas clave
- **Reportes de ocupación** y rendimiento
- **Análisis de canales** de distribución
- **Métricas financieras** detalladas

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 15.2.4** - Framework de React con App Router
- **React 19** - Biblioteca de interfaz de usuario
- **TypeScript 5** - Tipado estático completo
- **Tailwind CSS 3.4.17** - Framework de estilos utility-first

### UI/UX
- **Shadcn UI** - Sistema de componentes
- **Radix UI** - Componentes primitivos accesibles
- **Lucide React** - Iconografía moderna
- **Class Variance Authority** - Gestión de variantes

### Backend
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Base de datos
- **Row Level Security** - Seguridad granular
- **Autenticación** integrada

### Herramientas
- **React Hook Form** - Gestión de formularios
- **Zod** - Validación de esquemas
- **Recharts** - Gráficos y visualizaciones
- **date-fns** - Manipulación de fechas

## 📁 Estructura del Proyecto

```
TuriGest/
├── app/                    # Next.js App Router
│   ├── availability/       # Gestión de disponibilidad
│   ├── bookings/          # Gestión de reservas
│   ├── calendar/          # Calendario interactivo
│   ├── channels/          # Canales de distribución
│   ├── commission-settings/ # Configuración de comisiones
│   ├── guests/            # Gestión de huéspedes
│   ├── properties/        # Gestión de propiedades
│   ├── property-expenses/ # Gastos de propiedades
│   ├── reports/           # Reportes y análisis
│   ├── settings/          # Configuración general
│   └── traveler-guide-management/ # Gestión de guías
├── components/            # Componentes React
│   ├── ui/               # Componentes de Shadcn UI
│   └── ...               # Componentes específicos
├── lib/                  # Utilidades y configuración
│   ├── supabase.ts       # Cliente de Supabase
│   └── utils.ts          # Utilidades generales
├── scripts/              # Scripts SQL para base de datos
│   ├── 01-create-tables.sql
│   ├── 02-seed-data.sql
│   └── ...
└── contexts/             # Contextos de React
    └── AuthContext.tsx   # Contexto de autenticación
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o pnpm
- Cuenta de Supabase (opcional)

### 1. Clonar el repositorio
```bash
git clone https://github.com/iluenta/PMS.git
cd PMS
```

### 2. Instalar dependencias
```bash
npm install --legacy-peer-deps
# o
pnpm install
```

### 3. Configurar variables de entorno
Crear archivo `.env.local`:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima

# JWT Configuration (1 minute expiry)
NEXT_PUBLIC_JWT_EXPIRY=60
NEXT_PUBLIC_AUTH_PERSIST_SESSION=true
NEXT_PUBLIC_AUTH_AUTO_REFRESH_TOKEN=true

# Demo Mode (set to false for production)
NEXT_PUBLIC_DEMO_MODE=false
```

### 4. Ejecutar en modo desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🗄️ Configuración de Base de Datos

### Opción 1: Modo Demo (Recomendado para desarrollo)
El proyecto incluye datos mock que se cargan automáticamente cuando no hay configuración de Supabase.

### Opción 2: Supabase (Para producción)
1. Crear proyecto en [Supabase](https://supabase.com)
2. Ejecutar los scripts SQL en `/scripts/` en orden:
   ```sql
   01-create-tables.sql
   02-seed-data.sql
   03-add-financial-tables.sql
   04-seed-financial-data.sql
   05-add-traveler-guide-tables.sql
   06-seed-traveler-guide-data.sql
   07-add-availability-tables.sql
   08-seed-availability-data.sql
   09-create-users-table.sql
   ```
3. Configurar autenticación en Supabase:
   - Habilitar Email/Password en Authentication > Providers
   - Configurar JWT expiry en Authentication > Settings (60 segundos)
   - Los usuarios se crean automáticamente al registrarse

## 📊 Funcionalidades Principales

### Gestión de Propiedades
- ✅ Crear y editar propiedades
- ✅ Configurar disponibilidad y reglas
- ✅ Gestionar imágenes y comodidades
- ✅ Configurar precios y tarifas

### Sistema de Reservas
- ✅ Calendario interactivo
- ✅ Gestión de huéspedes
- ✅ Estados de reserva
- ✅ Fuentes de reserva

### 🔐 Autenticación y Seguridad
- ✅ Autenticación con Supabase
- ✅ Validación contra tabla users
- ✅ Tokens JWT de 1 minuto
- ✅ Roles de usuario (admin, manager, operator, viewer)
- ✅ Row Level Security (RLS)

### Gestión Financiera
- ✅ Configuración de comisiones
- ✅ Gestión de pagos
- ✅ Gastos de propiedades
- ✅ Reportes financieros

### Guías de Viajero
- ✅ Gestión de guías por propiedad
- ✅ Secciones personalizables
- ✅ Elementos dinámicos
- ✅ Vista previa

## 🔧 Scripts Disponibles

```bash
npm run dev      # Desarrollo
npm run build    # Construcción
npm run start    # Producción
npm run lint     # Linting
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👥 Autores

- **Pedro Ramírez** - *Desarrollo inicial* - [iluenta](https://github.com/iluenta)

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/) - Framework de React
- [Supabase](https://supabase.com/) - Backend-as-a-Service
- [Shadcn UI](https://ui.shadcn.com/) - Sistema de componentes
- [Tailwind CSS](https://tailwindcss.com/) - Framework de CSS

---

**TuriGest PMS** - Sistema completo para la gestión de propiedades turísticas 🏠✨ 