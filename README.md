# 💳 Tarjetas en Orden

Aplicación web responsiva, modular y lista para producción destinada al registro y control inteligente de gastos con tarjetas de crédito, compras en cuotas, resúmenes mensuales, devoluciones entre personas, gastos recurrentes y reportes familiares en Argentina.

---

## 🌟 Características Principales

- **Multi-Tenancy por Espacio Compartido ("Hogar")**: Permite la gestión conjunta de tarjetas y gastos por ambos integrantes de la pareja con roles de **Administrador** y **Miembro**.
- **Independencia de Monedas (`ARS` y `USD`)**: Muestra importes en Pesos Argentinos y Dólares Estadounidenses estrictamente separados. **Nunca** suma ni convierte automáticamente una moneda a la otra.
- **Independencia de Estados**:
  1. **Pago del Resumen (`statements`)**: Indica si el resumen mensual de una tarjeta ya fue abonado.
  2. **Recuperación del Dinero (`reimbursements`)**: Indica si la persona responsable devolvió el 100% del dinero.
- **Compras en Cuotas y Redondeo Exacto**: Distribución automática en $N$ cuotas ajustando centavos para asegurar que \(\sum \text{cuotas} = \text{total}\) exacto.
- **Visualización de Compromisos Futuros**: Proyección mensual de cuotas comprometidas a 12 meses vista.
- **Gastos Recurrentes Idempotentes**: Motor automático para suscripciones (Netflix, Spotify, seguros) sin duplicaciones.
- **Auditoría e Historial Inalterable (`audit_logs`)**: Registro transparente de todas las acciones sensibles.
- **PWA (Progressive Web App)**: Instalable en dispositivos móviles (Android/iOS) con manifest y pantalla offline.
- **Exportación e Importación CSV**: Descarga en formato CSV/Excel y sistema listo para importación masiva de resúmenes.

---

## 🚀 Tecnologías Utilizadas

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Lucide Icons.
- **Backend / DB**: Supabase (PostgreSQL, Supabase Auth, Storage, Row Level Security).
- **Pruebas**: Vitest, React Testing Library.
- **Despliegue**: Vercel + Supabase.

---

## 🛠️ Instalación y Configuración Local

### 1. Requisitos Previos

- Node.js v18.x o superior
- npm v10.x o superior
- Git

### 2. Clonar el Repositorio

```bash
git clone https://github.com/leandrolivera/tarjetas-en-orden.git
cd tarjetas-en-orden
```

### 3. Instalar Dependencias

```bash
npm install
```

### 4. Configurar Variables de Entorno

Copiá `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Configurá tus credenciales de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-de-supabase
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

### 5. Ejecutar la Aplicación en Desarrollo

```bash
npm run dev
```

Ingresá en tu navegador a `http://localhost:3000`.

---

## 🗄️ Configuración de la Base de Datos (Supabase)

1. En tu proyecto de Supabase, andá al **SQL Editor**.
2. Ejecutá la migración `supabase/migrations/01_schema.sql` para crear las tablas, índices y políticas RLS.
3. (Opcional) Ejecutá `supabase/migrations/02_seed.sql` para cargar las categorías iniciales predeterminadas.

---

## 🧪 Pruebas Automatizadas

Para ejecutar las pruebas de reglas de negocio con Vitest:

```bash
npm test
```

---

## 🌐 Publicación en Vercel y Supabase

1. Importá el repositorio `https://github.com/leandrolivera/tarjetas-en-orden.git` en Vercel.
2. Agregá las variables de entorno `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Vercel compilará automáticamente el proyecto Next.js.
