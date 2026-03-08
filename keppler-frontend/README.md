# Keppler Frontend

Este es el frontend de **Keppler**, desarrollado con **Angular 20**. Se encarga de mostrar un globo terráqueo/mapa interactivo utilizando **Leaflet** y calcular posiciones orbitales en tiempo real desde los TLEs con la librería **satellite.js**.

## 💻 Desarrollo Local

Este proyecto utiliza Angular CLI. Para empezar a desarrollar:

1. Instala las dependencias:
   ```bash
   npm install
   ```

2. Ejecuta el servidor de desarrollo:
   ```bash
   npm start
   ```
   *El servidor quedará expuesto y recargará de forma automática en caso de cambiar algún archivo fuente.*

## 📦 Construcción (Build)

Para compilar el proyecto a producción, ejecuta `npm run build`. Los artefactos compilados se almacenarán en el directorio `dist/`.

## 🐳 Docker

Para su entorno productivo o generalizado, es consumido desde el `docker-compose.yml` en la raíz. Este contenedor se construye utilizando el `Dockerfile` interno y se sirve todo el bundle estático típicamente a través de **Nginx** (usando la configuración de `nginx.conf`).
