import pandas as pd
import numpy as np
import psycopg2

DB_CONFIG = {"dbname": "oorja_aqi", "user": "postgres", "password": "password", "host": "localhost"}

def build_ml_matrix():
    conn = psycopg2.connect(**DB_CONFIG)
    query = "SELECT * FROM grid_features WHERE timestamp >= NOW() - INTERVAL '72 hours' ORDER BY grid_id, timestamp;"
    df = pd.read_sql_query(query, conn); conn.close()
    
    if df.empty: return None, None
    
    df = df.rename(columns={'pm25': 'PM2.5', 'pm10': 'PM10', 'no2': 'NO2', 'co': 'CO', 'so2': 'SO2', 'o3': 'O3', 'aqi': 'AQI'})
    
    for lag in [1, 2, 3, 24, 48]:
        df[f'aqi_lag_{lag}'] = df.groupby('grid_id')['AQI'].shift(lag)
        df[f'pm25_lag_{lag}'] = df.groupby('grid_id')['PM2.5'].shift(lag)
        
    df['aqi_roll_mean_6h'] = df.groupby('grid_id')['AQI'].transform(lambda x: x.rolling(6, min_periods=1).mean())
    df['aqi_roll_mean_24h'] = df.groupby('grid_id')['AQI'].transform(lambda x: x.rolling(24, min_periods=1).mean())
    df['aqi_roll_std_24h'] = df.groupby('grid_id')['AQI'].transform(lambda x: x.rolling(24, min_periods=1).std().fillna(0))
    
    df['hour_sin'] = np.sin(2 * np.pi * df['timestamp'].dt.hour / 24.0)
    df['hour_cos'] = np.cos(2 * np.pi * df['timestamp'].dt.hour / 24.0)
    df['month_sin'] = np.sin(2 * np.pi * df['timestamp'].dt.month / 12.0)
    df['month_cos'] = np.cos(2 * np.pi * df['timestamp'].dt.month / 12.0)
    
    latest_snapshots = df.groupby('grid_id').last().reset_index()
    return latest_snapshots

if __name__ == "__main__":
    matrix = build_ml_matrix()
    if matrix is not None: print("Feature Matrix Generated Successfully.")