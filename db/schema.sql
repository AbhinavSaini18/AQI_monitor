CREATE TABLE city_1km_grid (
    grid_id VARCHAR PRIMARY KEY,
    grid_x INT NOT NULL,
    grid_y INT NOT NULL,
    grid_polygon GEOMETRY(Polygon, 3857) NOT NULL
);
CREATE INDEX idx_grid_polygon ON city_1km_grid USING GIST (grid_polygon);

CREATE TABLE sensor_readings (
    reading_id SERIAL PRIMARY KEY,
    grid_id VARCHAR REFERENCES city_1km_grid(grid_id),
    timestamp TIMESTAMP NOT NULL,
    aqi INT,
    pm2_5 NUMERIC,
    pm10 NUMERIC,
    no2 NUMERIC,
    so2 NUMERIC
);
CREATE INDEX idx_sensor_grid_time ON sensor_readings (grid_id, timestamp);

CREATE TABLE weather_metrics (
    metric_id SERIAL PRIMARY KEY,
    grid_id VARCHAR REFERENCES city_1km_grid(grid_id),
    timestamp TIMESTAMP NOT NULL,
    temperature NUMERIC,
    wind_speed NUMERIC,
    wind_direction INT
);
CREATE INDEX idx_weather_grid_time ON weather_metrics (grid_id, timestamp);

CREATE TABLE traffic_metrics (
    metric_id SERIAL PRIMARY KEY,
    grid_id VARCHAR REFERENCES city_1km_grid(grid_id),
    timestamp TIMESTAMP NOT NULL,
    congestion_index NUMERIC,
    average_speed NUMERIC
);
CREATE INDEX idx_traffic_grid_time ON traffic_metrics (grid_id, timestamp);

CREATE TABLE static_emission_sources (
    source_id SERIAL PRIMARY KEY,
    grid_id VARCHAR REFERENCES city_1km_grid(grid_id),
    source_category TEXT,
    location_point GEOMETRY(Point, 4326),
    brightness_temp NUMERIC
);
CREATE INDEX idx_emission_location ON static_emission_sources USING GIST (location_point);

CREATE TABLE ai_predictions (
    prediction_id SERIAL PRIMARY KEY,
    grid_id VARCHAR REFERENCES city_1km_grid(grid_id),
    target_timestamp TIMESTAMP NOT NULL,
    predicted_aqi INT,
    source_attribution JSONB,
    confidence_score NUMERIC
);
CREATE INDEX idx_predictions_grid_time ON ai_predictions (grid_id, target_timestamp);