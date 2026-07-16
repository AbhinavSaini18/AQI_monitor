import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import root_mean_squared_error

# ==========================================
# 1. FILTERING DATA FOR DELHI
# ==========================================
print("Loading station mapping...")
stations_df = pd.read_csv("stations.csv")
stations_df.columns = stations_df.columns.str.strip()

delhi_stations = stations_df[stations_df['City'].str.lower() == 'delhi']['StationId'].unique()
print(f"Found {len(delhi_stations)} air quality stations in Delhi.")

print("Loading hourly station data...")
use_cols = ['StationId', 'Datetime', 'PM2.5', 'PM10', 'NO2', 'CO', 'SO2', 'O3', 'AQI']

chunks = []
for chunk in pd.read_csv("station_hour.csv", usecols=use_cols, chunksize=100000):
    filtered_chunk = chunk[chunk['StationId'].isin(delhi_stations)]
    chunks.append(filtered_chunk)

df = pd.concat(chunks, axis=0)
df['Datetime'] = pd.to_datetime(df['Datetime'])

# ==========================================
# 2. ROBUST MISSING VALUE HANDLING (IMPUTATION)
# ==========================================
print("Imputing missing sensor readings per station...")

# Sort first to ensure temporal continuity for interpolation
df = df.sort_values(by=['StationId', 'Datetime']).reset_index(drop=True)

# Select columns to interpolate
numeric_cols = ['PM2.5', 'PM10', 'NO2', 'CO', 'SO2', 'O3', 'AQI']

# Linearly interpolate missing values within each station group safely
for col in numeric_cols:
    df[col] = df.groupby('StationId')[col].transform(lambda x: x.interpolate(method='linear', limit=6).ffill().bfill())

# ==========================================
# 3. SPATIAL-TEMPORAL FEATURE ENGINEERING
# ==========================================
print("Engineering time-series lag and rolling features...")

# Create core lag features (past states)
for lag in [1, 2, 3, 24, 48]:
    df[f'aqi_lag_{lag}'] = df.groupby('StationId')['AQI'].shift(lag)
    df[f'pm25_lag_{lag}'] = df.groupby('StationId')['PM2.5'].shift(lag)

# Create rolling averages (trends)
df['aqi_roll_mean_6h'] = df.groupby('StationId')['AQI'].transform(lambda x: x.rolling(6, min_periods=1).mean())
df['aqi_roll_mean_24h'] = df.groupby('StationId')['AQI'].transform(lambda x: x.rolling(24, min_periods=1).mean())
df['aqi_roll_std_24h'] = df.groupby('StationId')['AQI'].transform(lambda x: x.rolling(24, min_periods=1).std().fillna(0))

# Temporal Cyclic Encodings (captures diurnal rhythms)
df['hour_sin'] = np.sin(2 * np.pi * df['Datetime'].dt.hour / 24.0)
df['hour_cos'] = np.cos(2 * np.pi * df['Datetime'].dt.hour / 24.0)
df['month_sin'] = np.sin(2 * np.pi * df['Datetime'].dt.month / 12.0)
df['month_cos'] = np.cos(2 * np.pi * df['Datetime'].dt.month / 12.0)

# ==========================================
# 4. CREATING TARGET LABELS (T+24, T+48, T+72)
# ==========================================
print("Creating target horizons...")
df['target_aqi_24h'] = df.groupby('StationId')['AQI'].shift(-24)
df['target_aqi_48h'] = df.groupby('StationId')['AQI'].shift(-48)
df['target_aqi_72h'] = df.groupby('StationId')['AQI'].shift(-72)

# Define feature spaces
feature_cols = [
    'PM2.5', 'PM10', 'NO2', 'CO', 'SO2', 'O3', 'AQI',
    'aqi_lag_1', 'aqi_lag_2', 'aqi_lag_3', 'aqi_lag_24', 'aqi_lag_48',
    'pm25_lag_1', 'pm25_lag_2', 'pm25_lag_3', 'pm25_lag_24', 'pm25_lag_48',
    'aqi_roll_mean_6h', 'aqi_roll_mean_24h', 'aqi_roll_std_24h',
    'hour_sin', 'hour_cos', 'month_sin', 'month_cos'
]

# Drop rows where targets or historical context are unavailable
clean_df = df.dropna(subset=['target_aqi_24h', 'target_aqi_48h', 'target_aqi_72h', 'aqi_lag_48']).reset_index(drop=True)

X = clean_df[feature_cols]

# ==========================================
# 5. MODEL TRAINING & BASELINE VERIFICATION
# ==========================================
horizons = {'24h': 'target_aqi_24h', '48h': 'target_aqi_48h', '72h': 'target_aqi_72h'}
trained_models = {}

for label, target_col in horizons.items():
    print(f"\n--- Training XGBoost Regressor for {label} Horizon ---")
    y = clean_df[target_col]
    
    # Train-Test Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Initialize Regressor
    model = xgb.XGBRegressor(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        n_jobs=-1
    )
    
    model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)
    preds = model.predict(X_test)
    
    # Calculate Metrics
    model_rmse = root_mean_squared_error(y_test, preds)
    
    # Persistence Baseline (Assumes Future AQI == Current AQI)
    baseline_preds = X_test['AQI']
    baseline_rmse = root_mean_squared_error(y_test, baseline_preds)
    
    improvement = ((baseline_rmse - model_rmse) / baseline_rmse) * 100
    
    print(f"Model RMSE: {model_rmse:.2f}")
    print(f"Persistence Baseline RMSE: {baseline_rmse:.2f}")
    print(f"🔥 Improvement over Baseline: {improvement:.2f}%")
    
    # Save model artifact
    model.save_model(f"xgboost_aqi_{label}.json")
    trained_models[label] = model