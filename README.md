# Carbón & Flama - Sistema de Gestión de Restaurante

Carbón & Flama es una solución integral para la gestión de restaurantes, diseñada con una arquitectura moderna que garantiza velocidad, persistencia y actualizaciones en tiempo real.

## 🚀 Tecnologías Principales

- **Frontend/Backend**: Next.js 16 (App Router)
- **Runtime**: Node.js 24
- **Base de Datos**: PostgreSQL 17 + Prisma ORM 7
- **Real-time**: Socket.io (WebSockets)
- **Estilos**: Tailwind CSS 4 + Lucide React
- **Seguridad**: NextAuth.js

## 📦 Estructura del Proyecto

- `/app`: Rutas del App Router y Server Actions.
- `/components`: Componentes reutilizables organizados por módulos (Salón, Cocina, Caja, Inventario).
- `/prisma`: Esquema de la base de datos y migraciones.
- `/lib`: Configuraciones compartidas (Prisma, Socket, Auth).
- `server.ts`: Servidor HTTP personalizado que integra Next.js con Socket.io.

## 🛠️ Instalación y Ejecución

### Opción 1: Con Docker (Recomendado)

Asegúrate de tener Docker y Docker Compose instalados.

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/carbon-flama.git
   cd carbon-flama
   ```

2. Ejecuta los contenedores:
   ```bash
   docker-compose up --build
   ```

3. El sistema estará disponible en `http://localhost:3000`.

### Opción 2: Desarrollo Local

1. Instala las dependencias:
   ```bash
   npm install
   ```

2. Configura tu `.env`:
   ```env
   DATABASE_URL="postgresql://usuario:password@localhost:5432/carbon_flama"
   NEXTAUTH_SECRET="tu-secreto-super-seguro"
   NEXTAUTH_URL="http://localhost:3000"
   ```

3. Genera el cliente Prisma:
   ```bash
   npx prisma generate
   ```

4. Ejecuta el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## 👨‍💻 Módulos del Sistema

- **Salón (Mozos)**: Mapa de mesas interactivo, toma de pedidos y carritos de compra persistentes.
- **Cocina**: Tablero Kanban para gestión de comandas con cronómetros de preparación.
- **Caja**: Cierre de cuentas, generación de comprobantes (Boleta/Factura) y liberación de mesas.
- **Inventario**: CRUD completo de insumos con alertas de stock crítico y ajustes rápidos.
- **Resumen (Admin)**: Dashboard con métricas de ventas, órdenes del día y salud del sistema.

## 📄 Licencia

Este proyecto es privado. Todos los derechos reservados para Carbón & Flama.
