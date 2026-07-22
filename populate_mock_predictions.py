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

# Clear existing
cur.execute("DELETE FROM ai_predictions")

with open("delhi_1km_grid.geojson") as f:
    data = json.load(f)

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
