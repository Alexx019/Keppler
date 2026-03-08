# Keppler Ingestor

Microservicio sin estado desarrollado en **Python** cuya tarea es obtener la información cruda del espacio. Se encarga de manera periódica y automatizada de adquirir el catálogo reciente de satélites y sus parámetros orbitales en formato **TLE** (Two-Line Elements).

## ⚙️ Funcionamiento

El flujo de trabajo que describe el script central `main.py` consta de:
1. Petición HTTP a un origen de datos espacial (como [CelesTrak](https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle)) para recuperar todos los TLEs de cargas útiles (payloads) activas.
2. Identificación del SATCAT asociado, nombre, y designación por cada satélite.
3. Actualización o inserción atómica (Upsert) de los datos hacia la base de datos PostgreSQL, dejando los registros sanos para su posterior consumo visual.

## 💻 Ejecución Manual en Local

1. Prepara idealmente un entorno virtual (venv) e instala los requerimientos:
   ```bash
   pip install -r requirements.txt
   ```

2. Ejecuta el ingestor habiendo proporcionado variables de enlace al endpoint de base de datos:
   ```bash
   export DATABASE_URL="postgresql://admin:password@localhost:5432/keppler_repository"
   export TLE_URL="https://celestrak.org/..."
   python main.py
   ```
