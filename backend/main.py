import os
import json
import requests
from datetime import datetime
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path

from db import (
    get_connection,
    AQICN_TOKEN,
    OPENWEATHER_KEY,
    TOMTOM_KEY,
    FIRMS_MAP_KEY
)

app = FastAPI(title="Delhi AQI Monitor Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent.parent

class ChatRequest(BaseModel):
    message: str
    grid_id: str = None

@app.get("/")
def read_root():
    return {"status": "Backend is running"}

@app.get("/grid")
def get_grid():
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT count(*) as cnt FROM city_1km_grid")
        row = cur.fetchone()
        
        if row and row['cnt'] >= 100:
            cur.execute("""
                SELECT grid_id, grid_x, grid_y, 
                       ST_AsGeoJSON(ST_Transform(grid_polygon, 4326)) AS geometry 
                FROM city_1km_grid
            """)
            rows = cur.fetchall()
            cur.close()
            conn.close()
            
            result = []
            for r in rows:
                result.append({
                    "grid_id": r["grid_id"],
                    "grid_x": r["grid_x"],
                    "grid_y": r["grid_y"],
                    "geometry": r["geometry"]
                })
            return result
        else:
            cur.close()
            conn.close()
            # Fallback to geojson
            geojson_path = BASE_DIR / "delhi_1km_grid.geojson"
            if not geojson_path.exists():
                raise HTTPException(status_code=404, detail="Grid data not found")
            
            with open(geojson_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            
            result = []
            features = data.get("features", [])
            for idx, feature in enumerate(features):
                props = feature.get("properties", {})
                grid_id = props.get("grid_id", f"grid_{idx}")
                geom = feature.get("geometry")
                
                grid_x = props.get("grid_x")
                grid_y = props.get("grid_y")
                
                result.append({
                    "grid_id": grid_id,
                    "grid_x": grid_x,
                    "grid_y": grid_y,
                    "geometry": geom
                })
            return result
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/predictions/heatmap")
def get_heatmap():
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT DISTINCT ON (grid_id) grid_id, predicted_aqi, source_attribution FROM ai_predictions ORDER BY grid_id, target_timestamp ASC")
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return rows
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/predictions/{grid_id}")
def get_prediction(grid_id: str):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM ai_predictions WHERE grid_id = %s ORDER BY target_timestamp ASC", (grid_id,))
        row = cur.fetchall()
        cur.close()
        conn.close()
        if not row or len(row) == 0:
            raise HTTPException(status_code=404, detail="Prediction not found")
        return row
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/attribution/{grid_id}")
def get_attribution(grid_id: str):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT source_attribution FROM ai_predictions WHERE grid_id = %s ORDER BY target_timestamp ASC", (grid_id,))
        row = cur.fetchone()
        cur.close()
        conn.close()
        if not row:
            raise HTTPException(status_code=404, detail="Attribution not found")
        return row['source_attribution']
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
def chat(request: ChatRequest):
    try:
        context = ""
        if request.grid_id:
            conn = get_connection()
            cur = conn.cursor()
            cur.execute("SELECT predicted_aqi, source_attribution FROM ai_predictions WHERE grid_id = %s ORDER BY target_timestamp ASC", (request.grid_id,))
            row = cur.fetchone()
            if row:
                context = f"Context for grid {request.grid_id}: Predicted AQI is {row['predicted_aqi']}. Attribution: {json.dumps(row['source_attribution'])}. "
            cur.close()
            conn.close()
            
        prompt = (
            "You are AIRA, an AI air quality assistant for Delhi. "
            "You have access to real-time AQI and satellite data for various grids in Delhi. "
            "Answer the user's questions clearly, concisely, and accurately based on the provided context. "
            "Do NOT say 'As an AI I don't have real-time capabilities'. You DO have them because they are injected into your context.\n\n"
            f"{context}\n"
            f"User: {request.message}\n"
            "AIRA:"
        )
        
        ollama_url = "http://localhost:11434/api/generate"
        payload = {
            "model": "mistral",
            "prompt": prompt,
            "stream": False
        }
        
        try:
            resp = requests.post(ollama_url, json=payload, timeout=10)
            resp.raise_for_status()
            data = resp.json()
            return {"answer": data.get("response", "No response from AI")}
        except requests.exceptions.RequestException:
            return {"answer": "I am currently unable to reach the AI engine (Ollama). Please try again later.", "fallback": True}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/live-aqi")
def get_live_aqi(lat: float = Query(...), lng: float = Query(...)):
    try:
        if not AQICN_TOKEN:
            raise HTTPException(status_code=500, detail="AQICN_TOKEN not configured")
        
        url = f"https://api.waqi.info/feed/geo:{lat};{lng}/?token={AQICN_TOKEN}"
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        
        if data.get("status") != "ok":
            raise HTTPException(status_code=500, detail="Error from WAQI API")
            
        waqi_data = data.get("data", {})
        iaqi = waqi_data.get("iaqi", {})
        
        return {
            "aqi": waqi_data.get("aqi"),
            "dominant_pollutant": waqi_data.get("dominentpol"),
            "station_name": waqi_data.get("city", {}).get("name"),
            "timestamp": waqi_data.get("time", {}).get("iso"),
            "pollutants": {
                "pm25": iaqi.get("pm25", {}).get("v") or 0,
                "pm10": iaqi.get("pm10", {}).get("v") or 0,
                "no2": iaqi.get("no2", {}).get("v") or 0,
                "so2": iaqi.get("so2", {}).get("v") or 0,
                "co": iaqi.get("co", {}).get("v") or 0,
                "o3": iaqi.get("o3", {}).get("v") or 0
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/live-aqi/delhi")
def get_live_aqi_delhi():
    try:
        if not AQICN_TOKEN:
            raise HTTPException(status_code=500, detail="AQICN_TOKEN not configured")
            
        url = f"https://api.waqi.info/feed/delhi/?token={AQICN_TOKEN}"
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        
        if data.get("status") != "ok":
            raise HTTPException(status_code=500, detail="Error from WAQI API")
            
        waqi_data = data.get("data", {})
        iaqi = waqi_data.get("iaqi", {})
        
        return {
            "aqi": waqi_data.get("aqi"),
            "dominant_pollutant": waqi_data.get("dominentpol"),
            "station_name": waqi_data.get("city", {}).get("name"),
            "timestamp": waqi_data.get("time", {}).get("iso"),
            "pollutants": {
                "pm25": iaqi.get("pm25", {}).get("v") or 0,
                "pm10": iaqi.get("pm10", {}).get("v") or 0,
                "no2": iaqi.get("no2", {}).get("v") or 0,
                "so2": iaqi.get("so2", {}).get("v") or 0,
                "co": iaqi.get("co", {}).get("v") or 0,
                "o3": iaqi.get("o3", {}).get("v") or 0
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/live-weather")
def get_live_weather(lat: float = Query(...), lng: float = Query(...)):
    try:
        if not OPENWEATHER_KEY:
            raise HTTPException(status_code=500, detail="OPENWEATHER_KEY not configured")
            
        url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lng}&appid={OPENWEATHER_KEY}&units=metric"
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        
        weather_list = data.get("weather", [{}])
        weather_info = weather_list[0] if weather_list else {}
        
        return {
            "temperature": data.get("main", {}).get("temp"),
            "feels_like": data.get("main", {}).get("feels_like"),
            "humidity": data.get("main", {}).get("humidity"),
            "pressure": data.get("main", {}).get("pressure"),
            "visibility": data.get("visibility"),
            "wind_speed": data.get("wind", {}).get("speed"),
            "wind_direction": data.get("wind", {}).get("deg"),
            "wind_gust": data.get("wind", {}).get("gust"),
            "description": weather_info.get("description"),
            "icon": weather_info.get("icon"),
            "clouds": data.get("clouds", {}).get("all"),
            "uv_index": None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
def get_health():
    db_ok = False
    ollama_ok = False
    
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT 1")
        cur.close()
        conn.close()
        db_ok = True
    except Exception:
        pass
        
    try:
        resp = requests.get("http://localhost:11434/", timeout=2)
        if resp.status_code == 200:
            ollama_ok = True
    except Exception:
        pass
        
    return {
        "status": "ok",
        "db": db_ok,
        "ollama": ollama_ok,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/sensor-readings/{grid_id}")
def get_sensor_readings(grid_id: str):
    try:
        conn = get_connection()
        cur = conn.cursor()
        
        cur.execute("SELECT MAX(timestamp) as latest_ts FROM sensor_readings WHERE grid_id = %s", (grid_id,))
        ts_row = cur.fetchone()
        
        if not ts_row or not ts_row['latest_ts']:
            cur.close()
            conn.close()
            return {"grid_id": grid_id, "timestamp": None}
            
        latest_ts = ts_row['latest_ts']
        
        cur.execute("SELECT pollutant, value FROM sensor_readings WHERE grid_id = %s AND timestamp = %s", (grid_id, latest_ts))
        rows = cur.fetchall()
        cur.close()
        conn.close()
        
        result = {
            "grid_id": grid_id,
            "timestamp": latest_ts.isoformat() if hasattr(latest_ts, 'isoformat') else str(latest_ts),
            "aqi": None,
            "pm25": None,
            "pm10": None,
            "no2": None,
            "so2": None,
            "co": None,
            "o3": None
        }
        
        pollutant_map = {
            'pm2.5': 'pm25',
            'pm10': 'pm10',
            'no2': 'no2',
            'so2': 'so2',
            'co': 'co',
            'o3': 'o3',
            'aqi': 'aqi',
        }
        for r in rows:
            pol = r['pollutant'].strip()
            key = pollutant_map.get(pol.lower(), pol.lower())
            if key in result:
                result[key] = r['value']
                
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/live-aqi/grid/{grid_id}")
def get_live_aqi_by_grid(grid_id: str):
    try:
        geojson_path = BASE_DIR / "delhi_1km_grid.geojson"
        if not geojson_path.exists():
            raise HTTPException(status_code=404, detail="Grid geojson not found")
            
        with open(geojson_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        target_feature = None
        for idx, feature in enumerate(data.get("features", [])):
            props = feature.get("properties", {})
            gid = props.get("grid_id", f"grid_{idx}")
            if gid == grid_id:
                target_feature = feature
                break
                
        if not target_feature:
            raise HTTPException(status_code=404, detail="Grid not found")
            
        geom = target_feature.get("geometry", {})
        if geom.get("type") == "Polygon":
            coords = geom.get("coordinates", [[]])[0]
            lng = sum(c[0] for c in coords) / len(coords)
            lat = sum(c[1] for c in coords) / len(coords)
        elif geom.get("type") == "Point":
            lng, lat = geom.get("coordinates")
        else:
            raise HTTPException(status_code=500, detail="Unsupported geometry")
        
        if not AQICN_TOKEN:
            raise HTTPException(status_code=500, detail="AQICN_TOKEN not configured")
        
        url = f"https://api.waqi.info/feed/geo:{lat};{lng}/?token={AQICN_TOKEN}"
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        
        if data.get("status") != "ok":
            raise HTTPException(status_code=500, detail="Error from WAQI API")
            
        waqi_data = data.get("data", {})
        iaqi = waqi_data.get("iaqi", {})
        
        station_name = waqi_data.get("city", {}).get("name")
        
        nom_url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lng}&zoom=14"
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"}
        try:
            nom_resp = requests.get(nom_url, headers=headers, timeout=5)
            if nom_resp.status_code == 200:
                nom_data = nom_resp.json()
                if 'address' in nom_data:
                    addr = nom_data['address']
                    locality = addr.get('suburb') or addr.get('neighbourhood') or addr.get('village') or addr.get('city_district') or addr.get('residential')
                    if locality:
                        station_name = f"{locality.upper()}"
                    else:
                        station_name = f"GRID {grid_id.upper()}"
            else:
                station_name = f"GRID {grid_id.upper()}"
        except Exception:
            station_name = f"GRID {grid_id.upper()}"
        
        return {
            "aqi": waqi_data.get("aqi"),
            "dominant_pollutant": waqi_data.get("dominentpol"),
            "station_name": station_name,
            "timestamp": waqi_data.get("time", {}).get("iso"),
            "pollutants": {
                "pm25": iaqi.get("pm25", {}).get("v") or 0,
                "pm10": iaqi.get("pm10", {}).get("v") or 0,
                "no2": iaqi.get("no2", {}).get("v") or 0,
                "so2": iaqi.get("so2", {}).get("v") or 0,
                "co": iaqi.get("co", {}).get("v") or 0,
                "o3": iaqi.get("o3", {}).get("v") or 0
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))