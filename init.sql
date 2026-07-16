-- Enable PostGIS extension for advanced spatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Unified Spatial spine (Alphanumeric grid IDs matching Mapbox mesh grid)
CREATE TABLE city_1km_grid (
    grid_id VARCHAR(50) PRIMARY KEY, -- e.g. 'grid_14_25' as per tech doc specs
    grid_x INT NOT NULL,
    grid_y INT NOT NULL,
    grid_polygon GEOMETRY(Polygon, 3857) NOT NULL -- Using 3857 for web-map meters matching
);
CREATE INDEX idx_grid_polygon_spatial ON city_1km_grid USING GIST(grid_polygon);

-- 2. Raw Ingestion Layer (Long format structure configured for live API worker feeds)
CREATE TABLE sensor_readings (
    reading_id SERIAL PRIMARY KEY,
    grid_id VARCHAR(50) REFERENCES city_1km_grid(grid_id),
    timestamp TIMESTAMP NOT NULL,
    pollutant VARCHAR(20) NOT NULL,
    value DOUBLE PRECISION NOT NULL
);
CREATE INDEX idx_sensor_readings_time ON sensor_readings (timestamp, grid_id);

-- 3. Central Feature Table (The engineering matrix built by Module 2)
CREATE TABLE grid_features (
    grid_id VARCHAR(50) REFERENCES city_1km_grid(grid_id),
    timestamp TIMESTAMP NOT NULL,
    pm25 DOUBLE PRECISION,
    pm10 DOUBLE PRECISION,
    no2 DOUBLE PRECISION,
    co DOUBLE PRECISION,
    so2 DOUBLE PRECISION,
    o3 DOUBLE PRECISION,
    aqi DOUBLE PRECISION,
    PRIMARY KEY (grid_id, timestamp)
);
CREATE INDEX idx_features_timeline ON grid_features (timestamp);

-- 4. Target Serving Layer (The final landing pad populated by Module 3 inference)
CREATE TABLE ai_predictions (
    prediction_id SERIAL PRIMARY KEY,
    grid_id VARCHAR(50) REFERENCES city_1km_grid(grid_id),
    target_timestamp TIMESTAMP NOT NULL,
    predicted_aqi INT NOT NULL,
    source_attribution JSONB NOT NULL, -- Storing structural SHAP heuristics percentages
    confidence_score NUMERIC NOT NULL,
    CONSTRAINT unique_grid_target_time UNIQUE (grid_id, target_timestamp)
);
CREATE INDEX idx_serving_hub ON ai_predictions (target_timestamp, grid_id);