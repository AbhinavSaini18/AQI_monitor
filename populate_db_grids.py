import json
import psycopg2
import random
from datetime import datetime, timedelta

conn = psycopg2.connect(
    dbname="oorja_aqi",
    user="postgres",
    password="password",
    host="localhost",
    port="5432"
)
cur = conn.cursor()

# 1. Insert grids into city_1km_grid
print("Inserting grids...")
cur.execute("DELETE FROM ai_predictions")

with open("delhi_1km_grid.geojson") as f:
    data = json.load(f)

for idx, feature in enumerate(data["features"]):
    props = feature.get("properties", {})
    grid_id = props.get("grid_id", f"grid_{idx}")
    grid_x = props.get("grid_x", 0)
    grid_y = props.get("grid_y", 0)
    geom_json = json.dumps(feature["geometry"])
    
    cur.execute("""
        INSERT INTO city_1km_grid (grid_id, grid_x, grid_y, grid_polygon)
        VALUES (%s, %s, %s, ST_Transform(ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326), 3857))
        ON CONFLICT (grid_id) DO NOTHING
    """, (grid_id, grid_x, grid_y, geom_json))

print(f"Inserted {len(data['features'])} grids.")

# 2. Insert mock AI predictions
print("Inserting mock predictions...")
base_time = datetime.now().replace(minute=0, second=0, microsecond=0)

for idx, feature in enumerate(data["features"]):
    props = feature.get("properties", {})
    grid_id = props.get("grid_id", f"grid_{idx}")
    
    # Generate realistic AQI (base 50-300 depending on location/random)
    base_aqi = random.randint(60, 250)
    
    # Generate realistic attributions (less crop burning, more traffic/dust)
    traffic = random.randint(30, 60)
    dust = random.randint(20, 40)
    industrial = random.randint(5, 20)
    crop = 100 - (traffic + dust + industrial)
    if crop < 0: crop = 0
    
    attr = {
        "traffic": traffic,
        "construction": dust,
        "industrial": industrial,
        "crop_burning": crop
    }
    
    # Insert for current time + a few future horizons
    for hr in [0, 3, 6, 12, 24]:
        ts = base_time + timedelta(hours=hr)
        aqi_val = max(0, base_aqi + random.randint(-30, 30))
        
        cur.execute("""
            INSERT INTO ai_predictions (grid_id, target_timestamp, predicted_aqi, source_attribution, confidence_score)
            VALUES (%s, %s, %s, %s, %s)
        """, (grid_id, ts, aqi_val, json.dumps(attr), 0.9))

conn.commit()
cur.close()
conn.close()
print("Populated ai_predictions for all grids.")
