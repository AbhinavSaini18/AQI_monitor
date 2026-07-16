import numpy as np
import pandas as pd
import psycopg2
from psycopg2.extras import execute_values

DB_CONFIG = {"dbname": "oorja_aqi", "user": "postgres", "password": "password", "host": "localhost"}

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
    cursor.execute("SELECT grid_id, ST_Y(centroid), ST_X(centroid) FROM city_grid;")
    grids = cursor.fetchall()
    grid_ids = [g[0] for g in grids]; grid_coords = np.array([[g[1], g[2]] for g in grids])
    
    cursor.execute("SELECT pollutant, ST_Y(geom), ST_X(geom), value FROM raw_air_quality WHERE timestamp = %s;", (target_time,))
    df_raw = pd.DataFrame(cursor.fetchall(), columns=['pollutant', 'lat', 'lon', 'value'])
    
    pollutants = ['PM2.5', 'PM10', 'NO2', 'CO', 'SO2', 'O3', 'AQI']
    interpolations = {'grid_id': grid_ids}
    
    for p in pollutants:
        p_data = df_raw[df_raw['pollutant'] == p]
        if p_data.empty:
            interpolations[p.lower()] = [None] * len(grid_ids)
            continue
        estimates = calculate_idw(p_data[['lat', 'lon']].values, p_data['value'].values, grid_coords)
        interpolations[p.lower()] = [float(x) if not np.isnan(x) else None for x in estimates]
        
    records = [(grid_ids[i], target_time, interpolations['pm2.5'][i], interpolations['pm10'][i], interpolations['no2'][i], interpolations['co'][i], interpolations['so2'][i], interpolations['o3'][i], interpolations['aqi'][i]) for i in range(len(grid_ids))]
    
    query = """INSERT INTO grid_features (grid_id, timestamp, pm25, pm10, no2, co, so2, o3, aqi) VALUES %s 
               ON CONFLICT (grid_id, timestamp) DO UPDATE SET pm25=EXCLUDED.pm25, pm10=EXCLUDED.pm10, no2=EXCLUDED.no2, co=EXCLUDED.co, so2=EXCLUDED.so2, o3=EXCLUDED.o3, aqi=EXCLUDED.aqi;"""
    execute_values(cursor, query, records); conn.commit(); cursor.close(); conn.close()
    print(f"Grid Features written for {target_time}")

if __name__ == "__main__":
    run_spatial_bus(pd.Timestamp.now())