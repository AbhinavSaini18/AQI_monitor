import os
import json
import requests
from pathlib import Path
from dotenv import load_dotenv
from grid_mapper import get_connection

load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

AQICN_TOKEN = os.getenv("AQICN_TOKEN")



# def load_fallback_aqicn():
#     with open("fallback_data/aqicn_sample.json") as f:
#         data = json.load(f)
#     iaqi = data["data"].get("iaqi", {})
#     return {
#         "aqi": data["data"].get("aqi"),
#         "pm2_5": iaqi.get("pm25", {}).get("v"),
#         "pm10": iaqi.get("pm10", {}).get("v"),
#         "no2": iaqi.get("no2", {}).get("v"),
#         "so2": iaqi.get("so2", {}).get("v"),
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
    return rows  # list of (grid_id, lat, lon)

def fetch_aqicn_reading(lat, lon):
    try:
        url = f"https://api.waqi.info/feed/geo:{lat};{lon}/?token={AQICN_TOKEN}"
        response = requests.get(url, timeout=10)
        data = response.json()

        if data.get("status") != "ok":
            raise ValueError("API returned non-ok status")

        iaqi = data["data"].get("iaqi", {})
        return {
            "aqi": data["data"].get("aqi"),
            "pm2_5": iaqi.get("pm25", {}).get("v"),
            "pm10": iaqi.get("pm10", {}).get("v"),
            "no2": iaqi.get("no2", {}).get("v"),
            "so2": iaqi.get("so2", {}).get("v"),
        }
    except Exception as e:
        print(f"  live call failed ({e}), using fallback data")
        # return load_fallback_aqicn()
def insert_reading(grid_id, reading):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO sensor_readings (grid_id, timestamp, aqi, pm2_5, pm10, no2, so2)
        VALUES (%s, NOW(), %s, %s, %s, %s, %s);
    """, (
        grid_id,
        reading["aqi"],
        reading["pm2_5"],
        reading["pm10"],
        reading["no2"],
        reading["so2"],
    ))
    conn.commit()
    cur.close()
    conn.close()

def run():
    points = get_sample_grid_points()
    print(f"Fetching AQICN data for {len(points)} sample grid points...")

    for grid_id, lat, lon in points:
        reading = fetch_aqicn_reading(lat, lon)
        if reading:
            insert_reading(grid_id, reading)
            print(f"{grid_id}: aqi={reading['aqi']}")
        else:
            print(f"{grid_id}: no data returned, skipping")

if __name__ == "__main__":
    run()