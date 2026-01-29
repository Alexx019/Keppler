import os
import time
import requests
import psycopg2
from psycopg2.extras import execute_values

# Configuración mediante variables de entorno
DB_URL = os.getenv("DATABASE_URL")
TLE_URL = os.getenv("TLE_URL")

def get_db_connection():
    return psycopg2.connect(DB_URL)

def init_db():
    conn = get_db_connection()
    cur = conn.cursor()
    # Creamos la tabla si no existe
    cur.execute("""
        CREATE TABLE IF NOT EXISTS tles (
            id SERIAL PRIMARY KEY,
            sat_name TEXT NOT NULL UNIQUE,
            line1 CHAR(69) NOT NULL,
            line2 CHAR(69) NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    conn.commit()
    cur.close()
    conn.close()

def fetch_and_save_tles():
    print("Iniciando ingesta de TLEs...")
    try:
        response = requests.get(TLE_URL)
        response.raise_for_status()
        lines = response.text.strip().split('\n')
        
        # El formato TLE son 3 líneas: Nombre, Línea 1, Línea 2
        data = []
        for i in range(0, len(lines), 3):
            if i+2 < len(lines):
                name = lines[i].strip()
                l1 = lines[i+1].strip()
                l2 = lines[i+2].strip()
                data.append((name, l1, l2))

        conn = get_db_connection()
        cur = conn.cursor()
        # Insertar o remplazar datos
        execute_values(cur, """ INSERT INTO tles (sat_name, line1, line2) 
                                VALUES %s 
                                ON CONFLICT (sat_name) 
                                DO UPDATE SET 
                                    line1 = EXCLUDED.line1, 
                                    line2 = EXCLUDED.line2;
                       """, data)
        conn.commit()
        print(f"Éxito: {len(data)} satélites procesados.")
    except Exception as e:
        print(f"Error durante la ingesta: {e}")
    finally:
        if conn:
            cur.close()
            conn.close()

if __name__ == "__main__":
    init_db()
    while True:
        fetch_and_save_tles()
        # Espera 3 horas (10800 segundos)
        print("Esperando 3 horas para la siguiente actualización...")
        time.sleep(10800)