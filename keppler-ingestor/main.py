import os
import sys

# Force unbuffered output so print statements appear immediately in Docker logs
sys.stdout.reconfigure(line_buffering=True)
sys.stderr.reconfigure(line_buffering=True)
import time
import requests
import psycopg2
import csv
from psycopg2.extras import execute_values

# Configuración mediante variables de entorno
DB_URL = os.getenv("DATABASE_URL")
TLE_URL = os.getenv("TLE_URL")

def get_db_connection():
    return psycopg2.connect(DB_URL)

def init_db():
    conn = get_db_connection()
    cur = conn.cursor()
    # Creamos la tabla si no existe, ahora con categoría y nuevos datos militares
    cur.execute("""
        CREATE TABLE IF NOT EXISTS tles (
            id SERIAL PRIMARY KEY,
            sat_name TEXT NOT NULL UNIQUE,
            category VARCHAR(50),
            norad_cat_id INT,
            launch_year INT,
            intl_designator VARCHAR(15),
            priority VARCHAR(20),
            owner VARCHAR(100),
            launch_site VARCHAR(100),
            ops_status VARCHAR(20),
            line1 CHAR(69) NOT NULL,
            line2 CHAR(69) NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    # Aseguramos que las nuevas columnas existen por si la tabla ya estaba creada antes
    cur.execute("""
        ALTER TABLE tles 
        ADD COLUMN IF NOT EXISTS category VARCHAR(50),
        ADD COLUMN IF NOT EXISTS norad_cat_id INT,
        ADD COLUMN IF NOT EXISTS launch_year INT,
        ADD COLUMN IF NOT EXISTS intl_designator VARCHAR(15),
        ADD COLUMN IF NOT EXISTS priority VARCHAR(20),
        ADD COLUMN IF NOT EXISTS owner VARCHAR(100),
        ADD COLUMN IF NOT EXISTS launch_site VARCHAR(100),
        ADD COLUMN IF NOT EXISTS ops_status VARCHAR(20);
    """)

    # Quitar satélites de starlink
    cur.execute("DELETE FROM tles WHERE category = 'Starlink';")

    cur.execute("""
        CREATE TABLE IF NOT EXISTS satellite_intel (
            sat_name TEXT PRIMARY KEY REFERENCES tles(sat_name) ON DELETE CASCADE,
            intel_description TEXT,
            intel_image_url TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    conn.commit()
    cur.close()
    conn.close()

from typing import Any, Dict

def download_satcat() -> Dict[int, Dict[str, str]]:
    print("Descargando catálogo SATCAT de celestrak...")
    url = "https://celestrak.org/pub/satcat.csv"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            lines = response.text.splitlines()
            reader = csv.DictReader(lines)
            satcat_dict: Dict[int, Dict[str, str]] = {}
            for row in reader:
                try:
                    nid = int(row["NORAD_CAT_ID"])
                    satcat_dict[nid] = {
                        "owner": row.get("OWNER", ""),
                        "launch_site": row.get("LAUNCH_SITE", ""),
                        "ops_status": row.get("OPS_STATUS_CODE", "")
                    }
                except ValueError:
                    continue
            print(f"Catálogo SATCAT descargado y parseado: {len(satcat_dict)} entradas.")
            return satcat_dict
        else:
            print(f"Error descargando SATCAT: Status {response.status_code}")
            return {}
    except Exception as e:
        print(f"Error parseando SATCAT: {e}")
        return {}

def get_military_priority(sat_name: str) -> str:
    name = sat_name.upper().strip()
    if name.startswith("USA-") or name.startswith("NROL-"):
        return "USA/High"
    if name.startswith("COSMOS"):
        return "Russia/High"
    if name.startswith("YAOGAN") or name.startswith("TJS"):
        return "China/High"
    if name.startswith("SHIYAN"):
        return "China/Experimental"
    return "Standard"

def fetch_and_save_tles():
    print("Iniciando ingesta de TLEs y enriquecimiento activo...")
    satcat_dict = download_satcat()
    
    # Grupos de Celestrak ampliados con satélites tácticos
    GROUPS = {
        "Stations": "https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle",
        "Weather": "https://celestrak.org/NORAD/elements/gp.php?GROUP=weather&FORMAT=tle",
        "Navigation": "https://celestrak.org/NORAD/elements/gp.php?GROUP=gnss&FORMAT=tle",
        "Communications": "https://celestrak.org/NORAD/elements/gp.php?GROUP=communications&FORMAT=tle",
        "Science": "https://celestrak.org/NORAD/elements/gp.php?GROUP=science&FORMAT=tle",
        "Military": "https://celestrak.org/NORAD/elements/gp.php?GROUP=military&FORMAT=tle",
        "Earth Resources": "https://celestrak.org/NORAD/elements/gp.php?GROUP=resource&FORMAT=tle",
        "Analyst": "https://celestrak.org/NORAD/elements/gp.php?GROUP=analyst&FORMAT=tle",
        "Radar": "https://celestrak.org/NORAD/elements/gp.php?GROUP=radar&FORMAT=tle",
        "GLONASS": "https://celestrak.org/NORAD/elements/gp.php?GROUP=glo-nnss&FORMAT=tle",
        "TJSAT": "https://celestrak.org/NORAD/elements/gp.php?GROUP=tjsat&FORMAT=tle"
    }

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        total_processed: int = 0

        for category, url in GROUPS.items():
            print(f"Descargando categoría: {category}...")
            response = requests.get(url)
            if response.status_code != 200:
                print(f"Error descargando {category} (Status: {response.status_code})")
                continue
                
            lines = response.text.strip().split('\n')
            unique_satellites = {} 

            for i in range(0, len(lines), 3):
                if i+2 < len(lines):
                    name = lines[i].strip()
                    l1 = lines[i+1].strip()
                    l2 = lines[i+2].strip()
                    
                    # TLE Parsing
                    try:
                        norad_cat_id = int(l1[2:7].strip())
                        designator = l1[9:17].strip()
                        year_str = l1[9:11].strip()
                        if year_str.isdigit():
                            y = int(year_str)
                            launch_year = 1900 + y if y > 50 else 2000 + y
                        else:
                            launch_year = None
                    except Exception:
                        norad_cat_id = None
                        designator = None
                        launch_year = None
                    
                    priority = get_military_priority(name)
                    
                    # Buscar en SATCAT
                    owner = None
                    launch_site = None
                    ops_status = None
                    if norad_cat_id and norad_cat_id in satcat_dict:
                        intel = satcat_dict.get(norad_cat_id, {})
                        owner = intel.get("owner")
                        launch_site = intel.get("launch_site")
                        ops_status = intel.get("ops_status")

                    unique_satellites[name] = (name, category, norad_cat_id, launch_year, designator, priority, owner, launch_site, ops_status, l1, l2)

            data = list(unique_satellites.values())

            if not data:
                print(f"No se encontraron datos válidos para {category}.")
                continue

            execute_values(cur, """ INSERT INTO tles (sat_name, category, norad_cat_id, launch_year, intl_designator, priority, owner, launch_site, ops_status, line1, line2) 
                                    VALUES %s 
                                    ON CONFLICT (sat_name) 
                                    DO UPDATE SET 
                                        category = EXCLUDED.category,
                                        norad_cat_id = EXCLUDED.norad_cat_id,
                                        launch_year = EXCLUDED.launch_year,
                                        intl_designator = EXCLUDED.intl_designator,
                                        priority = EXCLUDED.priority,
                                        owner = EXCLUDED.owner,
                                        launch_site = EXCLUDED.launch_site,
                                        ops_status = EXCLUDED.ops_status,
                                        line1 = EXCLUDED.line1, 
                                        line2 = EXCLUDED.line2,
                                        updated_at = CURRENT_TIMESTAMP;
                           """, data)
            conn.commit()
            total_processed += len(data) # type: ignore
            print(f"Éxito: {len(data)} satélites de {category}.")
            
            # Pequeña pausa para no saturar la API de Celestrak
            time.sleep(1)
            
        print(f"Ingesta finalizada. {total_processed} satélites procesados en total.")
        
    except Exception as e:
        print(f"Error durante la ingesta: {e}")
    finally:
        if 'conn' in locals() and conn:
            cur.close()
            conn.close()

def enrich_intel_from_wikipedia():
    print("Iniciando enriquecimiento de Inteligencia desde Wikipedia...")
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        while True:
            # Buscar satélites que no tengan entrada en satellite_intel
            # Limitamos a 50 por lote para no saturar la API de Wikipedia
            cur.execute("""
                SELECT t.sat_name 
                FROM tles t
                LEFT JOIN satellite_intel i ON t.sat_name = i.sat_name
                WHERE i.sat_name IS NULL
                LIMIT 50;
            """)
            
            missing_intel = cur.fetchall()
            
            if not missing_intel:
                print("Todos los satélites tienen su inteligencia en la base de datos.")
                break

            print(f"Procesando lote de {len(missing_intel)} satélites sin inteligencia...")
            
            new_intel_data = []
            for (sat_name,) in missing_intel:
                clean_name = sat_name.split(' (')[0].strip()
                search_term = f"{clean_name} satellite"
                
                # 1. Búsqueda en Wikipedia para encontrar el título exacto del artículo
                search_url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={requests.utils.quote(search_term)}&utf8=&format=json" # type: ignore
                
                intel_desc = None
                intel_img = None
                
                try:
                    headers = {'User-Agent': 'KepplerEyeBot/1.0 (info@keppler.com)'}
                    search_res = requests.get(search_url, headers=headers).json()
                    if search_res.get('query', {}).get('search'):
                        # Tomamos el primer resultado que suele ser el más relevante
                        top_hit_title = search_res['query']['search'][0]['title']
                        
                        # 2. Obtener el resumen de esa página concreta
                        summary_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{requests.utils.quote(top_hit_title)}" # type: ignore
                        summary_res = requests.get(summary_url, headers=headers).json()
                        
                        if summary_res.get('extract'):
                            intel_desc = summary_res['extract']
                        if summary_res.get('thumbnail', {}).get('source'):
                            intel_img = summary_res['thumbnail']['source']
                except Exception as e:
                    print(f"Error consultando Wikipedia para {sat_name}: {e}")
                
                # Guardamos el resultado aunque sea vacío (para no buscarlo infinitamente si no existe)
                new_intel_data.append((sat_name, intel_desc, intel_img))
                
                # Respetar la API de Wikipedia
                time.sleep(1)

            if new_intel_data:
                execute_values(cur, """
                    INSERT INTO satellite_intel (sat_name, intel_description, intel_image_url) 
                    VALUES %s 
                    ON CONFLICT (sat_name) 
                    DO UPDATE SET 
                        intel_description = EXCLUDED.intel_description,
                        intel_image_url = EXCLUDED.intel_image_url,
                        updated_at = CURRENT_TIMESTAMP;
                """, new_intel_data)
                conn.commit()
                print(f"Inteligencia guardada para {len(new_intel_data)} satélites. Continuando con el siguiente lote...")

    except Exception as e:
        print(f"Error en enriquecimiento de inteligencia: {e}")
    finally:
        if 'conn' in locals() and conn:
            cur.close()
            conn.close()

if __name__ == "__main__":
    init_db()
    while True:
        fetch_and_save_tles()
        enrich_intel_from_wikipedia()
        # Espera 3 horas (10800 segundos)
        print("Esperando 3 horas para la siguiente actualización...")
        time.sleep(10800)