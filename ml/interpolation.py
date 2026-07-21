import numpy as np
import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
import os
from dotenv import load_dotenv
load_dotenv()
DB_CONFIG = {"dbname": os.getenv("DB_NAME"), "user": os.getenv("DB_USER"), "password": os.getenv("DB_PASSWORD"), "host": os.getenv("DB_HOST")}

def calculate_idw(station_coords, station_values, grid_coords, power=2.0):
    if len(station_values) == 0: return np.nan
    estimates = []
    for g_coord in grid_coords:
        distances = np.linalg.norm(station_coords - g_coord, axis=1) * 111.0  # Approx to km
        distances = np.clip(distances, a_min=0.01, a_max=None)
        w = 1.0 / (distances ** power)
        estimates.append(np.sum(w * station_values) / np.sum(w))
    return np.array(estimates)

def run_spatial_bus(target_time):
    conn = psycopg2.connect(**DB_CONFIG); cursor = conn.cursor()
    cursor.execute("""
    SELECT
        grid_id,
        ST_Y(ST_Transform(ST_Centroid(grid_polygon), 4326)) AS lat,
        ST_X(ST_Transform(ST_Centroid(grid_polygon), 4326)) AS lon
    FROM city_1km_grid;
""")
    grids = cursor.fetchall()
    grid_ids = [g[0] for g in grids]; grid_coords = np.array([[g[1], g[2]] for g in grids])
    cursor.execute("""
        SELECT sr.grid_id, sr.pm2_5, sr.pm10, sr.no2, sr.so2, sr.aqi,
            ST_Y(ST_Transform(ST_Centroid(g.grid_polygon), 4326)) AS lat,
            ST_X(ST_Transform(ST_Centroid(g.grid_polygon), 4326)) AS lon
        FROM sensor_readings sr
        JOIN city_1km_grid g ON sr.grid_id = g.grid_id
        WHERE sr.timestamp >= NOW() - INTERVAL '1 hour';
    """)
    df_raw = cursor.fetchall()
    # columns, in order: grid_id, pm2_5, pm10, no2, so2, aqi, lat, lon

    if len(df_raw) == 0:
        print("No recent sensor readings found — skipping interpolation for now.")
        cursor.close()
        conn.close()
        return

    station_coords = np.array([[row[6], row[7]] for row in df_raw])  # lat, lon

    interpolations = {'grid_id': grid_ids}
    pollutant_columns = {'pm2_5': 1, 'pm10': 2, 'no2': 3, 'so2': 4, 'aqi': 5}

    for name, col_index in pollutant_columns.items():
        values = np.array([float(row[col_index]) for row in df_raw if row[col_index] is not None])
        coords = np.array([[row[6], row[7]] for row in df_raw if row[col_index] is not None])

        if len(values) == 0:
            interpolations[name] = [None] * len(grid_ids)
            continue

        estimates = calculate_idw(coords, values, grid_coords)
        interpolations[name] = [float(x) if not np.isnan(x) else None for x in estimates]
    records = [
    (grid_ids[i], target_time,
     interpolations['pm2_5'][i], interpolations['pm10'][i],
     interpolations['no2'][i], interpolations['so2'][i],
     interpolations['aqi'][i])
    for i in range(len(grid_ids))
]

    query = """
        INSERT INTO sensor_readings (grid_id, timestamp, pm2_5, pm10, no2, so2, aqi)
        VALUES %s;
    """
    execute_values(cursor, query, records)
    conn.commit()
    cursor.close()
    conn.close()
    print(f"Interpolated readings written for {target_time}")
    


if __name__ == "__main__":
    run_spatial_bus(pd.Timestamp.now())