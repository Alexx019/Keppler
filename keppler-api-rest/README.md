# Keppler API REST

Microservicio desarrollado en **Node.js** con base en **Express** para el proyecto Keppler. 

Su función principal es ofrecer endpoints consumibles desde el `keppler-frontend`, actuando de capa intermediaria segura para conectarse a la **Base de Datos PostgreSQL** y retornar los catálogos y registros de satélites activos ("TLEs").

## 💻 Desarrollo Local

Asegúrate de tener en ejecución primero la base de datos (por ejemplo, levantando el servicio `keppler-db` de Docker Compose) antes de correr esta API en local y evitar errores de conexión.

1. Instala las librerías:
   ```bash
   npm install
   ```

2. Ejecuta el microservicio principal:
   ```bash
   node src/index.js
   ```

El servidor funcionará por defecto localmente en el puerto `9010`.

## ⚙️ Variables de Entorno

Requiere fundamentalmente la provisión de las variables en su entorno para operar:
- `DATABASE_URL`: URI de conexión en formato PostgreSQL (Ej: `postgresql://admin:password@localhost:5432/keppler_repository`)
