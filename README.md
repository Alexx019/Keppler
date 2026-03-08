# 🛰️ Keppler

**Keppler** es un proyecto de código abierto para el rastreo y visualización de satélites utilizando datos TLE (Two-Line Element set). Más allá del seguimiento orbital puro, **Keppler busca democratizar y centralizar el acceso a los datos científicos**, ofreciendo acceso a todos los portales de datos públicos asociados a cada satélite. El sistema está diseñado utilizando una arquitectura moderna de microservicios, permitiendo la ingesta automática, el almacenamiento y la visualización interactiva de órbitas satelitales.

## 🏗️ Arquitectura del Sistema

El proyecto se compone de cuatro piezas fundamentales, orquestadas y comunicadas mediante Docker Compose:

1. **Frontend (`keppler-frontend`)**: 
   Aplicación SPA (Single Page Application) desarrollada en **Angular 20**. Utiliza **Leaflet** para la renderización cartográfica del mapa interactivo y la librería **satellite.js** para el cálculo matemático de posiciones orbitales en tiempo real directamente en el navegador de los usuarios.

2. **API REST (`keppler-api-rest`)**: 
   Servicio backend ligero desarrollado en **Node.js** utilizando el framework **Express**. Expone la información satelital enriquecida almacenada en la base de datos hacia el frontend.

3. **Ingestor (`keppler-ingestor`)**: 
   Microservicio escrito en **Python** responsable de descargar de forma autónoma los últimos datos TLE activos (provenientes de [CelesTrak](https://celestrak.org/)) y volcarlos estructuradamente en la base de datos relacional.

4. **Base de Datos (`keppler-db`)**: 
   Motor principal de almacenamiento utilizando **PostgreSQL 15**. Guarda el inventario de satélites y persiste la data histórica/reciente que provee el Ingestor.

## 🚀 Requisitos Previos

Para ejecutar este proyecto en tu entorno local sin complicaciones, únicamente necesitas tener instalado:

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

## 🛠️ Instalación y Puesta en Marcha

El ecosistema entero está preparado para ser levantado con un solo comando gracias a Docker Compose. Desde el directorio raíz del proyecto, ejecuta de forma habitual:

```bash
docker compose up --build
```

Este comando descargará las imágenes base correspondientes, construirá las imágenes personalizadas de los microservicios, configurará las variables de entorno y levantará los contenedores en la misma red.

### 🌐 Puertos y Accesos

Por defecto, tras ejecutar el sistema, los servicios estarán disponibles en los siguientes endpoints locales:

- **Frontend (Interfaz de Usuario)**: [http://localhost:9011](http://localhost:9011)
- **API REST**: [http://localhost:9010](http://localhost:9010)
- **Base de Datos**: Accesible de manera interna en la network de Docker bajo el puerto `5432`.

## 📂 Estructura de Directorios

```text
Keppler/
├── docker-compose.yml      # Definición de la orquestación e infraestructura local
├── README.md               # Documentación principal del proyecto
├── keppler-frontend/       # Código fuente y assets de la aplicación Angular (UI)
├── keppler-api-rest/       # Endpoints e integración HTTP de la API web en Node.js
└── keppler-ingestor/       # Scripts en Python para lectura, parseo e ingesta de TLEs
```

## 🎯 Mejoras Próximas y Funcionalidades

- **Integración Nativa de Datos Científicos**: Transición desde ofrecer enlaces a portales externos hacia la conexión, obtención e integración visual directa de los reportes y telemetrías públicas dentro del propio panel de Keppler.
- Seguimiento ("Target Lock") de satélites para que la cámara los persiga.
- Ampliación de información de los satélites mezclando catálogos CSV y orígenes externos.
- Estilos visuales de mapa oscuros integrados en la interfaz para mejor visualización.

## 🤝 Contribuciones

Si deseas mejorar Keppler, todas las contribuciones y mejoras son gratamente bienvenidas. 
Siéntete libre de hacer un _fork_ del repositorio, crear una rama con tus _features_ y abrir un Pull Request para revisión.

---
*Desarrollado para la comunidad, la exploración del espacio y la pasión por el rastreo satelital. 🚀*
