# 💳 Tarjetas en Orden

Aplicación web responsiva, modular y lista para producción destinada al registro y control inteligente de gastos con tarjetas de crédito, compras en cuotas, resúmenes mensuales, devoluciones entre personas, gastos recurrentes y reportes familiares en Argentina.

---

## 📋 Tabla de Contenidos

1. [Características Principales](#-características-principales)
2. [Reglas de Negocio Clave](#-reglas-de-negocio-clave)
3. [Tecnologías Utilizadas](#-tecnologías-utilizadas)
4. [Estructura del Proyecto](#-estructura-del-proyecto)
5. [Paso a Paso: Configuración de Base de Datos en Supabase](#-paso-a-paso-configuración-de-base-de-datos-en-supabase)
6. [Paso a Paso: Despliegue en Cloudflare Pages](#-paso-a-paso-despliegue-en-cloudflare-pages)
7. [Desarrollo Local y Pruebas](#-desarrollo-local-y-pruebas)
8. [Importación y Exportación CSV](#-importación-y-exportación-csv)

---

## 🌟 Características Principales

- **Multi-Tenancy por Espacio Compartido ("Hogar")**: Gestión conjunta de tarjetas y gastos por ambos integrantes de la pareja con roles de **Administrador** y **Miembro**.
- **Independencia de Monedas (`ARS` y `USD`)**: Muestra importes en Pesos Argentinos y Dólares Estadounidenses estrictamente separados. **Nunca** suma ni convierte automáticamente una moneda a la otra.
- **Independencia Total de Estados**:
  1. **Pago del Resumen (`statements`)**: Indica si el resumen mensual de una tarjeta ya fue abonado al banco.
  2. **Recuperación del Dinero (`reimbursements`)**: Indica si la persona responsable devolvió el 100% del dinero.
- **Compras en Cuotas y Redondeo Exacto**: Distribución automática en $N$ cuotas ajustando centavos sobrantes en las primeras cuotas para asegurar que \(\sum \text{cuotas} = \text{total}\) exacto.
- **Proyección de Cuotas Futuras**: Visualización de compromisos de cuotas futuras en los próximos 12 meses.
- **Gastos Recurrentes Idempotentes**: Motor automático para suscripciones (Netflix, Spotify, seguros) sin duplicaciones.
- **Auditoría e Historial Inalterable (`audit_logs`)**: Registro transparente de todas las acciones sensibles.
- **PWA (Progressive Web App)**: Instalable en dispositivos móviles (Android/iOS) con manifest y pantalla offline.
- **Exportación e Importación CSV**: Descarga en formato CSV/Excel y sistema listo para importación masiva de resúmenes.

---

## 📐 Reglas de Negocio Clave

1. **Separación Estricta de Monedas**: Los importes en ARS ($) y USD (USD) se muestran desglosados y jamás se combinan ni convierten en un total acumulado.
2. **Desacoplamiento de Resúmenes y Devoluciones**: Marcar un resumen de tarjeta como pagado NO altera ni cierra las devoluciones pendientes entre personas.
3. **Devoluciones Totales (100%)**: Las obligaciones de devolución solo admiten estados `Pendiente` o `Recibida`. No existen pagos parciales en esta versión.
4. **Distribución de Centavos**: Al dividir un gasto en cuotas (ej. $100 en 3 cuotas), se generan $33,34, $33,33 y $33,33 sumando exactamente $100,00.
5. **Protección de Gastos en Resúmenes Pagados**: Editar compras en cuotas asociadas a resúmenes ya pagados requiere confirmación y genera un registro de auditoría.
6. **Seguridad de Tarjetas**: Únicamente se almacenan los últimos 4 dígitos. Jamás se solicitan ni guardan números completos, CVV o claves bancarias.

---

## 🚀 Tecnologías Utilizadas

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Lucide Icons.
- **Backend / DB**: Supabase (PostgreSQL, Supabase Auth, Storage, Row Level Security).
- **Pruebas**: Vitest, React Testing Library.
- **Despliegue**: Cloudflare Pages / Vercel + Supabase.

---

## 🗄️ Paso a Paso: Configuración de Base de Datos en Supabase

### 1. Crear el Proyecto en Supabase
1. Ingresá a [supabase.com](https://supabase.com) e iniciá sesión.
2. Hacé clic en **"New Project"**.
3. Definí el nombre del proyecto (ej. `tarjetas-en-orden`) y una contraseña segura para la base de datos PostgreSQL.
4. Seleccioná la región más cercana (ej. `South America (São Paulo)`) y confirmá con **"Create new project"**.

### 2. Ejecutar el Esquema de Base de Datos y Políticas RLS
1. En el panel lateral de Supabase, andá a **SQL Editor** (ícono `>_`).
2. Hacé clic en **"New Query"**.
3. Copiá el contenido del archivo [`supabase/migrations/01_schema.sql`](file:///d:/Documentos/Tarjetas%20en%20Orden/supabase/migrations/01_schema.sql) del repositorio.
4. Pegalo en el editor SQL y hacé clic en **"Run"**.
   > *Esto creará las 15 tablas normalizadas (`profiles`, `households`, `cards`, `expenses`, `statements`, `reimbursements`, `recurring_expenses`, `audit_logs`, etc.) con políticas Row Level Security (RLS).*

### 3. Cargar las Categorías Predeterminadas (Seed)
1. Abrí una nueva consulta en el **SQL Editor**.
2. Copiá y pegá el contenido del archivo [`supabase/migrations/02_seed.sql`](file:///d:/Documentos/Tarjetas%20en%20Orden/supabase/migrations/02_seed.sql).
3. Hacé clic en **"Run"**.
   > *Esto insertará las categorías iniciales (Supermercado, Comida, Salidas, Servicios, Combustible, etc.).*

### 4. Configurar Almacenamiento para Comprobantes (Opcional)
1. Andá a **Storage** en el menú de Supabase.
2. Hacé clic en **"New Bucket"**.
3. Nombre: `receipts` (marcado como **Private Bucket**).

### 5. Obtener las Claves API de Supabase
1. Andá a **Project Settings** ➔ **API**.
2. Copiá:
   - **Project URL** (ejemplo: `https://xxxxxx.supabase.co`)
   - **anon / public key** (ejemplo: `eyJhbGci...`)

---

## ⚡ Paso a Paso: Despliegue en Cloudflare Pages

### 1. Conectar el Repositorio de GitHub
1. Ingresá a [dash.cloudflare.com](https://dash.cloudflare.com/).
2. Andá a **Workers & Pages** ➔ **Create Application** ➔ Pestaña **Pages**.
3. Hacé clic en **Connect to Git** y elegí el repositorio `leandrolivera/tarjetas-en-orden`.
4. Hacé clic en **Begin setup**.

### 2. Configurar el Build en Cloudflare Pages
- **Project Name**: `tarjetas-en-orden`
- **Production Branch**: `main`
- **Framework preset**: **Next.js (Static HTML Export)** o **Next.js**
- **Build command**:
  ```bash
  npx @cloudflare/next-on-pages
  ```
- **Build output directory**:
  ```text
  .vercel/output/static
  ```

### 3. Agregar Variables de Entorno en Cloudflare
En la sección **Environment variables (advanced)** agregá:

| Variable | Valor |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` |
| `NODE_VERSION` | `20` |

### 4. Desplegar
Hacé clic en **Save and Deploy**. Cloudflare Pages compilará el proyecto y generará la URL pública. Cada nuevo commit en `main` desplegará automáticamente.

---

## 🧪 Desarrollo Local y Pruebas

### Instalación local

```bash
git clone https://github.com/leandrolivera/tarjetas-en-orden.git
cd tarjetas-en-orden
npm install
npm run dev
```

### Pruebas Automatizadas

```bash
npm test
```

### Compilación de Producción Local

```bash
npm run build
```

---

## 📊 Importación y Exportación CSV

- **Exportación**: Podés exportar tus gastos desde la sección `/export` o directamente en el listado de gastos.
- **Importación**: Incluye un archivo de muestra en [`public/ejemplo_importacion_gastos.csv`](file:///d:/Documentos/Tarjetas%20en%20Orden/public/ejemplo_importacion_gastos.csv) con el formato normalizado:
  `fecha;descripcion;comercio;importe;moneda;tarjeta;categoria;cuotas;responsable`
