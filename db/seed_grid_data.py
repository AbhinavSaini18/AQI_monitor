import os
import json
import datetime
from pathlib import Path

try:
    import psycopg2
    HAS_PSYCOPG2 = True
except ImportError:
    HAS_PSYCOPG2 = False

try:
    from dotenv import load_dotenv
    env_path = Path(__file__).resolve().parent.parent / ".env"
    load_dotenv(dotenv_path=env_path)
except ImportError:
    pass

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", 5432))
DB_NAME = os.getenv("DB_NAME", "postgres")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASS = os.getenv("DB_PASSWORD", "password")

def list_arange(start, stop, step):
    curr = start
    while curr < stop:
        yield curr
        curr += step

def generate_delhi_grids():
    min_lat, max_lat = 28.45, 28.78
    min_lng, max_lng = 77.00, 77.36
    
    lat_step = 0.009
    lng_step = 0.0102

    grids = []
    row = 0
    for lat in list_arange(min_lat, max_lat, lat_step):
        col = 0
        for lng in list_arange(min_lng, max_lng, lng_step):
            dist_center = ((lat - 28.6139)**2 + (lng - 77.2090)**2)**0.5
            if dist_center < 0.22:
                grid_id = f"grid_{100 + row}_{3000 + col}"
                
                dist_hotspot = ((lat - 28.65)**2 + (lng - 77.30)**2)**0.5
                base_aqi = max(80, int(410 - dist_hotspot * 950))
                noise = (Math_sin(row * 4 + col * 7) * 35) + (Math_cos(row * 11) * 25)
                
                grids.append({
                    "grid_id": grid_id,
                    "grid_x": col,
                    "grid_y": row,
                    "min_lat": round(lat, 5),
                    "max_lat": round(lat + lat_step, 5),
                    "min_lng": round(lng, 5),
                    "max_lng": round(lng + lng_step, 5),
                    "aqi": max(0, int(base_aqi + noise)),
                    "attribution": {
                        "vehicular_traffic": 35,
                        "crop_burning": 30,
                        "inversion_weather": 20,
                        "construction_dust": 15
                    }
                })
            col += 1
        row += 1
    
    return grids

import math
def Math_sin(x): return math.sin(x)
def Math_cos(x): return math.cos(x)

def seed_database():
    print("===================================================")
    print("🌐 Seeding PostGIS Database with 1km x 1km Grid Map")
    print("===================================================")
    
    if not HAS_PSYCOPG2:
        print("ℹ️ 'psycopg2' is not installed.")
        return

    grids = generate_delhi_grids()
    print(f"Generated {len(grids)} grid polygons covering NCT Delhi...")

    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASS
        )
        conn.autocommit = True
        cur = conn.cursor()
        
        cur.execute("CREATE EXTENSION IF NOT EXISTS postgis;")
        
        # Ensure schema table exists without throwing error
        cur.execute("""
            CREATE TABLE IF NOT EXISTS city_1km_grid (
                grid_id VARCHAR(50) PRIMARY KEY,
                grid_x INT NOT NULL,
                grid_y INT NOT NULL,
                grid_polygon GEOMETRY(Polygon, 3857) NOT NULL
            );
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS ai_predictions (
                prediction_id SERIAL PRIMARY KEY,
                grid_id VARCHAR(50) REFERENCES city_1km_grid(grid_id),
                target_timestamp TIMESTAMP NOT NULL,
                predicted_aqi INT NOT NULL,
                source_attribution JSONB NOT NULL,
                confidence_score NUMERIC NOT NULL,
                CONSTRAINT unique_grid_target_time UNIQUE (grid_id, target_timestamp)
            );
        """)

        inserted_grids = 0

        for g in grids:
            geom_wkt = f"POLYGON(({g['min_lng']} {g['min_lat']}, {g['max_lng']} {g['min_lat']}, {g['max_lng']} {g['max_lat']}, {g['min_lng']} {g['max_lat']}, {g['min_lng']} {g['min_lat']}))"
            
            cur.execute("""
                INSERT INTO city_1km_grid (grid_id, grid_x, grid_y, grid_polygon)
                VALUES (%s, %s, %s, ST_Transform(ST_GeomFromText(%s, 4326), 3857))
                ON CONFLICT (grid_id) DO NOTHING;
            """, (g["grid_id"], g["grid_x"], g["grid_y"], geom_wkt))

            cur.execute("""
                INSERT INTO ai_predictions (grid_id, target_timestamp, predicted_aqi, source_attribution, confidence_score)
                VALUES (%s, NOW(), %s, %s, %s)
                ON CONFLICT (grid_id, target_timestamp) DO UPDATE SET predicted_aqi = EXCLUDED.predicted_aqi;
            """, (g["grid_id"], g["aqi"], json.dumps(g["attribution"]), 0.88))

            inserted_grids += 1

        cur.close()
        conn.close()

        print(f"🎉 Successfully seeded {inserted_grids} 1km grids into PostgreSQL!")
        print("FastAPI endpoint http://localhost:8000/grid is ready to serve.")

    except Exception as e:
        print(f"⚠️ Database connection error: {e}")

def export_geojson():
    grids = generate_delhi_grids()
    features = []

    for g in grids:
        features.append({
            "type": "Feature",
            "properties": {
                "grid_id": g["grid_id"],
                "grid_x": g["grid_x"],
                "grid_y": g["grid_y"],
                "predicted_aqi": g["aqi"],
                "land_use": "Commercial / Industrial" if g["aqi"] > 200 else "Residential / Mixed"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [g["min_lng"], g["min_lat"]],
                    [g["max_lng"], g["min_lat"]],
                    [g["max_lng"], g["max_lat"]],
                    [g["min_lng"], g["max_lat"]],
                    [g["min_lng"], g["min_lat"]]
                ]]
            }
        })

    geojson = {
        "type": "FeatureCollection",
        "features": features
    }

    out_path = Path(__file__).resolve().parent.parent / "delhi_1km_grid.geojson"
    with open(out_path, "w") as f:
        json.dump(geojson, f, indent=2)

    print(f"📄 Exported {len(features)}-polygon 1km GeoJSON grid file to: {out_path}")

if __name__ == "__main__":
    export_geojson()
    seed_database()
