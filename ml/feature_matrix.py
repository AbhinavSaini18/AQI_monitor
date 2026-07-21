import pandas as pd
import numpy as np
import psycopg2
import os
from dotenv import load_dotenv
load_dotenv()
DB_CONFIG = {"dbname": os.getenv("DB_NAME"), "user": os.getenv("DB_USER"), "password": os.getenv("DB_PASSWORD"), "host": os.getenv("DB_HOST")}

def build_ml_matrix():
    """
    Stage 3: Joins across all backend API metrics tables by grid_id and timestamp.
    Pulls recent history to fulfill rolling lookback shift window variables.
    """
    conn = psycopg2.connect(**DB_CONFIG)
    
    print("Fetching live backend metric streams from database...")
    # SQL query joining sensor, weather, and traffic data streams by grid_id + hour timestamps
    query = """
            SELECT 
                f.grid_id,
                f.timestamp,
                f.pm2_5 AS "PM2.5",
                f.pm10 AS "PM10",
                f.no2 AS "NO2",
                f.co AS "CO",
                f.so2 AS "SO2",
                f.o3 AS "O3",
                f.aqi AS "AQI",
                w.temperature,
                w.wind_speed,
                w.wind_direction,
                t.congestion_index,
                t.average_speed
            FROM sensor_readings f
            LEFT JOIN weather_metrics w ON f.grid_id = w.grid_id AND DATE_TRUNC('hour', f.timestamp) = DATE_TRUNC('hour', w.timestamp)
            LEFT JOIN traffic_metrics t ON f.grid_id = t.grid_id AND DATE_TRUNC('hour', f.timestamp) = DATE_TRUNC('hour', t.timestamp)
            WHERE f.timestamp >= NOW() - INTERVAL '72 hours'
            ORDER BY f.grid_id, f.timestamp;
    """
    
    df = pd.read_sql_query(query, conn)
    conn.close()
    
    if df.empty:
        print("Warning: No recent telemetry records returned from database joins.")
        return None
        
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df = df.sort_values(by=['grid_id', 'timestamp']).reset_index(drop=True)

    
    # Forward-fill gaps per spatial grid tracking spine
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    df[numeric_cols] = df.groupby('grid_id')[numeric_cols].transform(lambda x: x.ffill().bfill().fillna(0))

    print("Engineering rolling features and lag histories...")
    # Calculate time lags
    for lag in [1, 2, 3, 24, 48]:
        df[f'aqi_lag_{lag}'] = df.groupby('grid_id')['AQI'].shift(lag)
        df[f'pm25_lag_{lag}'] = df.groupby('grid_id')['PM2.5'].shift(lag)
        
    # Calculate trends
    df['aqi_roll_mean_6h'] = df.groupby('grid_id')['AQI'].transform(lambda x: x.rolling(6, min_periods=1).mean())
    df['aqi_roll_mean_24h'] = df.groupby('grid_id')['AQI'].transform(lambda x: x.rolling(24, min_periods=1).mean())
    df['aqi_roll_std_24h'] = df.groupby('grid_id')['AQI'].transform(lambda x: x.rolling(24, min_periods=1).std().fillna(0))
    
    # Cyclical time tracking vectors
    df['hour_sin'] = np.sin(2 * np.pi * df['timestamp'].dt.hour / 24.0)
    df['hour_cos'] = np.cos(2 * np.pi * df['timestamp'].dt.hour / 24.0)
    df['month_sin'] = np.sin(2 * np.pi * df['timestamp'].dt.month / 12.0)
    df['month_cos'] = np.cos(2 * np.pi * df['timestamp'].dt.month / 12.0)
    
    # Isolate only the most recent hourly snapshot to run live predictions on
    latest_snapshots = df.groupby('grid_id').last().reset_index()
    return latest_snapshots