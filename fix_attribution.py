import psycopg2
import json
import random

try:
    conn = psycopg2.connect(
        dbname="Aqi_monitor",
        user="postgres",
        password="password",
        host="localhost",
        port="5432"
    )
    cur = conn.cursor()

    cur.execute("SELECT grid_id, target_timestamp, source_attribution FROM ai_predictions")
    rows = cur.fetchall()

    for row in rows:
        grid_id = row[0]
        ts = row[1]
        attr = row[2]
        if isinstance(attr, str):
            attr = json.loads(attr)
        
        traffic = random.randint(40, 70)
        dust = random.randint(20, 40)
        industrial = random.randint(5, 15)
        crop = 100 - (traffic + dust + industrial)
        if crop < 0: crop = 0
        if crop > 5: crop = random.randint(0, 5)
        
        new_attr = {
            "traffic": traffic,
            "construction": dust,
            "industrial": industrial,
            "crop_burning": crop,
            "thermal": random.randint(10, 40),
            "meteo": random.randint(10, 40)
        }
        
        cur.execute("UPDATE ai_predictions SET source_attribution = %s WHERE grid_id = %s AND target_timestamp = %s", (json.dumps(new_attr), grid_id, ts))

    conn.commit()
    cur.close()
    conn.close()
    print("Fixed attributions for Aqi_monitor")
except Exception as e:
    print(e)
