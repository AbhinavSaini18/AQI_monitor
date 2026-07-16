import psycopg2
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

def get_connection():

    return psycopg2.connect(
        host="localhost",
        port=5432,
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
    )

def find_grid_id(lat, lon):
    conn = get_connection()
    cur = conn.cursor()

    query = """
        SELECT grid_id
        FROM city_1km_grid
        WHERE ST_Contains(
            grid_polygon,
            ST_Transform(ST_SetSRID(ST_MakePoint(%s, %s), 4326), 3857)
        )
        LIMIT 1;
    """
    cur.execute(query, (lon, lat))
    result = cur.fetchone()

    cur.close()
    conn.close()

    return result[0] if result else None