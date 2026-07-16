import os
import json
import requests
from pathlib import Path
from dotenv import load_dotenv
from grid_mapper import get_connection


# def load_fallback_weather():
#     with open("fallback_data/weather_sample.json") as f:
#         data = json.load(f)
#     return {
#         "temperature": data.get("main", {}).get("temp"),
#         "wind_speed": data.get("wind", {}).get("speed"),
#         "wind_direction": data.get("wind", {}).get("deg"),
#     }
# load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

OPENWEATHER_KEY = os.getenv("OPENWEATHER_KEY")

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

def fetch_weather_reading(lat, lon):
    try:
        url = (
            f"https://api.openweathermap.org/data/2.5/weather"
            f"?lat={lat}&lon={lon}&appid={OPENWEATHER_KEY}&units=metric"
        )
        response = requests.get(url, timeout=10)
        data = response.json()

        if str(data.get("cod")) != "200":
            raise ValueError("API returned non-200 cod")

        return {
            "temperature": data.get("main", {}).get("temp"),
            "wind_speed": data.get("wind", {}).get("speed"),
            "wind_direction": data.get("wind", {}).get("deg"),
        }
    except Exception as e:
        print(f"  live call failed ({e}), using fallback data")
        # return load_fallback_weather()  

def insert_reading(grid_id, reading):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO weather_metrics (grid_id, timestamp, temperature, wind_speed, wind_direction)
        VALUES (%s, NOW(), %s, %s, %s);
    """, (
        grid_id,
        reading["temperature"],
        reading["wind_speed"],
        reading["wind_direction"],
    ))
    conn.commit()
    cur.close()
    conn.close()

def run():
    points = get_sample_grid_points()
    print(f"Fetching weather data for {len(points)} sample grid points...")

    for grid_id, lat, lon in points:
        reading = fetch_weather_reading(lat, lon)
        if reading:
            insert_reading(grid_id, reading)
            print(f"{grid_id}: temp={reading['temperature']}, wind={reading['wind_speed']}")
        else:
            print(f"{grid_id}: no data returned, skipping")

if __name__ == "__main__":
    run()