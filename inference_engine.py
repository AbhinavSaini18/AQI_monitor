import xgboost as xgb
import psycopg2
from psycopg2.extras import execute_values
import json
import pandas as pd
from matrix_builder import build_ml_matrix

DB_CONFIG = {"dbname": "oorja_aqi", "user": "postgres", "password": "password", "host": "localhost"}

def run_predictions():
    latest_snapshots = build_ml_matrix()
    if latest_snapshots is None or latest_snapshots.empty:
        print("Matrix generation empty. Halting.")
        return
        
    feature_cols = [
        'PM2.5', 'PM10', 'NO2', 'CO', 'SO2', 'O3', 'AQI',
        'aqi_lag_1', 'aqi_lag_2', 'aqi_lag_3', 'aqi_lag_24', 'aqi_lag_48',
        'pm25_lag_1', 'pm25_lag_2', 'pm25_lag_3', 'pm25_lag_24', 'pm25_lag_48',
        'aqi_roll_mean_6h', 'aqi_roll_mean_24h', 'aqi_roll_std_24h',
        'hour_sin', 'hour_cos', 'month_sin', 'month_cos'
    ]
    
    X_live = latest_snapshots[feature_cols]
    
    m24 = xgb.XGBRegressor(); m24.load_model("xgboost_aqi_24h.json")
    m48 = xgb.XGBRegressor(); m48.load_model("xgboost_aqi_48h.json")
    m72 = xgb.XGBRegressor(); m72.load_model("xgboost_aqi_72h.json")
    
    p24, p48, p72 = m24.predict(X_live), m48.predict(X_live), m72.predict(X_live)
    
    insert_records = []
    for idx, row in latest_snapshots.iterrows():
        grid_id = row['grid_id']; current_time = row['timestamp']
        
        # Heuristic Source scoring loop calculations
        t_sc = max(5.0, float(row['NO2']) * 1.2 + float(row['CO']) * 10.0)
        i_sc = max(5.0, float(row['SO2']) * 2.5 + float(row['NO2']) * 0.5)
        c_sc = max(5.0, float(row['PM2.5']) * 0.8)
        tot = t_sc + i_sc + c_sc + 10.0
        
        attr = json.dumps({"traffic": round((t_sc/tot)*100), "industrial": round((i_sc/tot)*100), "crop_burning": round((c_sc/tot)*100), "other": round((10.0/tot)*100)})
        
        insert_records.append((grid_id, current_time + pd.Timedelta(hours=24), int(p24[idx]), attr, 0.88))
        insert_records.append((grid_id, current_time + pd.Timedelta(hours=48), int(p48[idx]), attr, 0.79))
        insert_records.append((grid_id, current_time + pd.Timedelta(hours=72), int(p72[idx]), attr, 0.71))
        
    conn = psycopg2.connect(**DB_CONFIG); cursor = conn.cursor()
    query = """INSERT INTO ai_predictions (grid_id, target_timestamp, predicted_aqi, source_attribution, confidence_score) VALUES %s 
               ON CONFLICT (grid_id, target_timestamp) DO UPDATE SET predicted_aqi=EXCLUDED.predicted_aqi, source_attribution=EXCLUDED.source_attribution, confidence_score=EXCLUDED.confidence_score;"""
    execute_values(cursor, query, insert_records); conn.commit(); cursor.close(); conn.close()
    print("Predictions committed cleanly to ai_predictions.")

if __name__ == "__main__":
    run_predictions()