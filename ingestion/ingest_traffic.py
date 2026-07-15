import os
import json
import requests
from pathlib import Path
from dotenv import load_dotenv
from grid_mapper import get_connection

load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

TOMTOM_KEY = os.getenv("TOMTOM_KEY")



# def load_fallback_traffic():
#     with open("fallback_data/traffic_sample.json") as f:
#         data = json.load(f)
#     segment = data.get("flowSegmentData", {})
#     current_speed = segment.get("currentSpeed")
#     free_flow_speed = segment.get("freeFlowSpeed")

#     if current_speed is None or free_flow_speed is None or free_flow_speed == 0:
#         return {"congestion_index": 0, "average_speed": current_speed or 0}

#     congestion_index = round((1 - (current_speed / free_flow_speed)) * 100, 2)
#     return {
#         "congestion_index": congestion_index,
#         "average_speed": current_speed,
#     }
def get_sample_grid_points():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT
            grid_id,
            ST_Y(ST_Transform(ST_Centroid(grid_polygon), 4326)) AS lat,
            ST_X(ST_Transform(ST_Centroid(grid_polygon), 4326)) AS lon
        FROM city_1km_grid
        WHERE grid_x % 5 = 0 AND grid_y % 5 = 0;
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return rows

def fetch_traffic_reading(lat, lon):
    try:
        url = (
            f"https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json"
            f"?point={lat},{lon}&key={TOMTOM_KEY}"
        )
        response = requests.get(url, timeout=10)

        if response.status_code != 200:
            raise ValueError(f"status code {response.status_code}")

        data = response.json()
        segment = data.get("flowSegmentData")
        if not segment:
            raise ValueError("no flowSegmentData in response")

        current_speed = segment.get("currentSpeed")
        free_flow_speed = segment.get("freeFlowSpeed")

        if current_speed is None or free_flow_speed is None or free_flow_speed == 0:
            raise ValueError("missing or zero speed values")

        congestion_index = round((1 - (current_speed / free_flow_speed)) * 100, 2)

        return {
            "congestion_index": congestion_index,
            "average_speed": current_speed,
        }
    except Exception as e:
        print(f"  live call failed ({e}), using fallback data")
        # return load_fallback_traffic()

def insert_reading(grid_id, reading):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO traffic_metrics (grid_id, timestamp, congestion_index, average_speed)
        VALUES (%s, NOW(), %s, %s);
    """, (
        grid_id,
        reading["congestion_index"],
        reading["average_speed"],
    ))
    conn.commit()
    cur.close()
    conn.close()

def run():
    points = get_sample_grid_points()
    print(f"Fetching traffic data for {len(points)} sample grid points...")

    success = 0
    for grid_id, lat, lon in points:
        reading = fetch_traffic_reading(lat, lon)
        if reading:
            insert_reading(grid_id, reading)
            success += 1
            print(f"{grid_id}: congestion={reading['congestion_index']}%, speed={reading['average_speed']}")
        else:
            print(f"{grid_id}: no road segment data, skipping")

    print(f"\nDone. {success}/{len(points)} points had usable traffic data.")

if __name__ == "__main__":
    run()