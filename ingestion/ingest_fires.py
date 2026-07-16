import os
import csv
import io
import requests
from pathlib import Path
from dotenv import load_dotenv
from grid_mapper import get_connection, find_grid_id

load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

FIRMS_MAP_KEY = os.getenv("FIRMS_MAP_KEY")

# Delhi bounding box, same one used for the grid itself
DELHI_BBOX = "76.8384,28.4041,77.3464,28.8836"

def fetch_fire_data():
    url = (
        f"https://firms.modaps.eosdis.nasa.gov/api/area/csv/"
        f"{FIRMS_MAP_KEY}/VIIRS_SNPP_NRT/{DELHI_BBOX}/1"
    )
    response = requests.get(url, timeout=15)

    if response.status_code != 200:
        return []

    csv_text = response.text
    reader = csv.DictReader(io.StringIO(csv_text))
    return list(reader)

def insert_fire(grid_id, lat, lon, brightness, category="Crop_Fire"):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO static_emission_sources (grid_id, source_category, location_point, brightness_temp)
        VALUES (
            %s, %s,
            ST_SetSRID(ST_MakePoint(%s, %s), 4326),
            %s
        );
    """, (grid_id, category, lon, lat, brightness))
    conn.commit()

    cur.close()
    conn.close()

def run():
    fires = fetch_fire_data()
    print(f"Found {len(fires)} fire detections in Delhi bounding box.")

    if len(fires) == 0:
        print("No active fires detected — this is normal, not an error.")
        return

    inserted = 0
    for row in fires:
        lat = float(row["latitude"])
        lon = float(row["longitude"])
        brightness = float(row.get("bright_ti4", 0))

        grid_id = find_grid_id(lat, lon)
        if grid_id:
            insert_fire(grid_id, lat, lon, brightness)
            inserted += 1
            print(f"{grid_id}: brightness={brightness}")
        else:
            print(f"Point ({lat},{lon}) fell outside our grid, skipping")

    print(f"\nDone. {inserted}/{len(fires)} fires inserted.")

if __name__ == "__main__":
    run()