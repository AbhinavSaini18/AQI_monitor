import os
import psycopg2
from psycopg2.extras import execute_values
import pandas as pd
import numpy as np

DB_CONFIG = {
    "dbname": os.getenv("PGDATABASE", "oorja_aqi"),
    "user": os.getenv("PGUSER", "postgres"),
    "password": os.getenv("PGPASSWORD", "password"),
    "host": os.getenv("PGHOST", "localhost"),
}

def seed_mock_data():
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    print("Seeding grid spine (city_1km_grid)...")
    # Generate a small 3x3 testing grid bounding box space
    grid_records = []
    grid_ids = []
    for x in range(3):
        for y in range(3):
            g_id = f"grid_{x}_{y}"
            grid_ids.append(g_id)
            # Simple 1km mock box polygons using web mercator projection coordinates
            poly_wkt = f"SRID=3857;POLYGON(({x*1000} {y*1000}, {(x+1)*1000} {y*1000}, {(x+1)*1000} {(y+1)*1000}, {x*1000} {(y+1)*1000}, {x*1000} {y*1000}))"
            grid_records.append((g_id, x, y, poly_wkt))
            
    cursor.execute("TRUNCATE city_1km_grid CASCADE;")
    execute_values(cursor, "INSERT INTO city_1km_grid (grid_id, grid_x, grid_y, grid_polygon) VALUES %s;", grid_records)
    
    print("Generating 72 hours of continuous baseline sensor entries...")
    # Replicate the past 72 hours to satisfy your rolling shift parameters
    timestamps = pd.date_range(end=pd.Timestamp.now(), periods=72, freq='h')
    pollutants = ['PM2.5', 'PM10', 'NO2', 'CO', 'SO2', 'O3', 'AQI']
    
    sensor_records = []
    features_records = []
    
    for g_id in grid_ids:
        for ts in timestamps:
            ts_str = ts.strftime('%Y-%m-%d %H:%M:%S')
            
            # Synthesize realistic variations
            base_pm25 = 60.0 + np.sin(ts.hour) * 20.0 + np.random.normal(0, 5)
            base_aqi = base_pm25 * 1.2 + np.random.normal(0, 10)
            
            vals = {
                'PM2.5': max(10.0, base_pm25),
                'PM10': max(20.0, base_pm25 * 1.5),
                'NO2': max(5.0, 30.0 + np.sin(ts.hour) * 10.0),
                'CO': max(0.1, 1.2 + np.cos(ts.hour) * 0.4),
                'SO2': max(2.0, 12.0 + np.random.normal(0, 2)),
                'O3': max(5.0, 45.0 - np.sin(ts.hour) * 15.0),
                'AQI': max(10.0, base_aqi)
            }
            
            # 1. Fill individual sensor log rows (simulate raw ingestion)
            for p in pollutants:
                sensor_records.append((g_id, ts_str, p, float(vals[p])))
                
            # 2. Directly populate grid_features so you can test Module 2 and 3 instantly
            features_records.append((
                g_id, ts_str,
                float(vals['PM2.5']), float(vals['PM10']), float(vals['NO2']),
                float(vals['CO']), float(vals['SO2']), float(vals['O3']), float(vals['AQI'])
            ))

    print("Writing records to sensor_readings...")
    execute_values(cursor, "INSERT INTO sensor_readings (grid_id, timestamp, pollutant, value) VALUES %s;", sensor_records)
    
    print("Writing records directly to grid_features...")
    execute_values(cursor, """INSERT INTO grid_features (grid_id, timestamp, pm25, pm10, no2, co, so2, o3, aqi) 
                             VALUES %s;""", features_records)
    
    conn.commit()
    cursor.close()
    conn.close()
    print("✨ Mock DB testing state successfully initialized!")

if __name__ == "__main__":
    seed_mock_data()