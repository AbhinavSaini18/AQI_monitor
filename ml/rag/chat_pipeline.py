import os
import re
import psycopg2
import requests
from pathlib import Path
from dotenv import load_dotenv
from geopy.geocoders import Nominatim

# Force load the .env file dynamically targeting the root folder
BASE_DIR = Path(__file__).resolve().parent.parent.parent
dotenv_path = BASE_DIR / ".env"
load_dotenv(dotenv_path=dotenv_path)

print(f"[DEBUG] Looking for .env at: {dotenv_path}")
print(f"[DEBUG] DB_NAME loaded: {os.getenv('DB_NAME')}")
print(f"[DEBUG] DB_PASSWORD loaded: {'***' if os.getenv('DB_PASSWORD') else 'None'}")

# Initialize geocoder for natural language place extraction
geolocator = Nominatim(user_agent="aqi_monitor_pipeline")

def get_db_connection():
    """Connect to the PostgreSQL database."""
    return psycopg2.connect(
        host="localhost",
        port=5432,
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
    )

def extract_location(text):
    """Dynamically extracts a location name from any natural sentence structure."""
    text_lower = text.lower()
    # Matches prepositions like "in", "at", "for", "near" followed by place names
    match = re.search(r'\b(?:in|at|for|near|of)\s+([a-zA-Z\s]+?)(?:\?|\.|,|$)', text_lower)
    if match:
        place = match.group(1).strip()
        # Clean out common trailing or filler words
        place = re.sub(r'\b(right now|today|tomorrow|aqi|air quality|the)\b', '', place).strip()
        if place:
            return place.title()
    return None

def get_grid_id_from_location(place_name):
    """Use geopy and PostGIS ST_Contains to find the matching 1km grid cell."""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        location = geolocator.geocode(place_name + ", Delhi, India")
        if location:
            lon, lat = location.longitude, location.latitude
            spatial_query = """
                SELECT grid_id FROM city_1km_grid 
                WHERE ST_Contains(grid_polygon, ST_SetSRID(ST_MakePoint(%s, %s), 4326))
                LIMIT 1;
            """
            cur.execute(spatial_query, (lon, lat))
            row = cur.fetchone()
            if row:
                print(f"[INFO] Mapped '{place_name}' (Lat: {lat}, Lon: {lon}) -> Grid ID: {row[0]}")
                return row[0]
    except Exception as e:
        print(f"[ERROR] Spatial lookup error: {e}")
    finally:
        cur.close()
        conn.close()
    return None

def query_aqi_data(grid_id, lookback_hours=72):
    """Fetch current metrics and future XGBoost predictions for the target grid cell."""
    if not grid_id:
        return {}
        
    conn = get_db_connection()
    cur = conn.cursor()

    # 1. Get the latest live metrics snapshot
    live_query = """
    SELECT sr.pm2_5, sr.pm10, sr.no2, sr.co, sr.so2, sr.o3, sr.aqi, sr.timestamp
    FROM sensor_readings sr
    WHERE sr.grid_id = %s AND sr.timestamp >= NOW() - INTERVAL '%s hours'
    ORDER BY sr.timestamp DESC LIMIT 1;
    """
    cur.execute(live_query, (grid_id, lookback_hours))
    live_row = cur.fetchone()
    
    # 2. Get future AI forecasts
    forecast_query = """
    SELECT target_timestamp, predicted_aqi, source_attribution, confidence_score
    FROM ai_predictions
    WHERE grid_id = %s AND target_timestamp > NOW()
    ORDER BY target_timestamp ASC LIMIT 3;
    """
    cur.execute(forecast_query, (grid_id,))
    forecast_rows = cur.fetchall()
    
    cur.close()
    conn.close()

    if not live_row and not forecast_rows:
        return {}

    result = {
        "pm2_5": live_row[0] if live_row else None, 
        "pm10": live_row[1] if live_row else None, 
        "no2": live_row[2] if live_row else None,
        "co": live_row[3] if live_row else None, 
        "so2": live_row[4] if live_row else None, 
        "o3": live_row[5] if live_row else None,
        "aqi": live_row[6] if live_row else None, 
        "timestamp": live_row[7] if live_row else None,
        "forecasts": []
    }
    
    for row in forecast_rows:
        result["forecasts"].append({
            "time": row[0],
            "aqi": row[1],
            "attribution": row[2], 
            "confidence": row[3]
        })
        
    return result

def format_data_context(data):
    """Format both live metrics and future ML predictions as a text context block."""
    if not data or (data.get("aqi") is None and not data.get("forecasts")):
        return "No telemetry or predictive metrics available for this sector."

    aqi_str = f"{data['aqi']:.1f}" if data.get('aqi') is not None else "N/A"
    pm25_str = f"{data['pm2_5']:.1f}" if data.get('pm2_5') is not None else "N/A"
    pm10_str = f"{data['pm10']:.1f}" if data.get('pm10') is not None else "N/A"
    no2_str = f"{data['no2']:.1f}" if data.get('no2') is not None else "N/A"
    co_str = f"{data['co']:.1f}" if data.get('co') is not None else "N/A"

    lines = ["=== CURRENT REAL-TIME SNAPSHOT ==="]
    lines.append(f"Current Measured AQI: {aqi_str}")
    lines.append(f"PM2.5: {pm25_str} ug/m3 | PM10: {pm10_str} ug/m3")
    lines.append(f"NO2: {no2_str} ug/m3 | CO: {co_str} mg/m3")
    
    if data.get("forecasts"):
        lines.append("\n=== FUTURE FORECASTS (GENERATED VIA XGBOOST MACHINE LEARNING) ===")
        for f in data["forecasts"]:
            time_str = f["time"].strftime("%Y-%m-%d %H:%M")
            lines.append(f"• Target Time: {time_str}")
            lines.append(f"  Predicted AQI: {f['aqi']} (Model Confidence: {f['confidence']*100:.0f}%)")
            if f["attribution"]:
                attr = f["attribution"]
                lines.append(f"  Source Risk: Traffic: {attr.get('traffic')}% | Industrial: {attr.get('industrial')}% | Crop Burning: {attr.get('crop_burning')}%")
                
    return "\n".join(lines)

def generate_llm_response_ollama(user_query, grid_id=None):
    """Generate response using Ollama local serving layer, supporting natural language location queries."""
    
    # 1. If no explicit grid_id was provided, parse it from the user's sentence
    if not grid_id:
        detected_place = extract_location(user_query)
        if detected_place:
            grid_id = get_grid_id_from_location(detected_place)
            
    # 2. Fetch data for the resolved grid cell
    data = query_aqi_data(grid_id) if grid_id else {}
    
    # 3. Fallback if still empty
    if not data:
        print("[INFO] Target grid context empty. Fetching latest available grid metrics block...")
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT grid_id FROM sensor_readings ORDER BY timestamp DESC LIMIT 1;")
        row = cur.fetchone()
        cur.close()
        conn.close()
        if row:
            grid_id = row[0]
            data = query_aqi_data(grid_id)

    context = format_data_context(data)

    system_prompt = f"""You are an urban air quality assistant chatbot.
[GROUNDING TELEMETRY DATA]
{context}

INSTRUCTION: Answer the user's inquiry using only the grounding telemetry data provided above. Speak in plain, conversational English. Do not formulate metrics or assume values not explicitly listed."""

    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "mistral",
                "prompt": f"{system_prompt}\n\nUser Question: {user_query}\nChatbot Answer:",
                "stream": False,
                "options": {"temperature": 0.2}
            },
            timeout=45
        )
        response.raise_for_status()
        return response.json().get("response", "Error: Model returned an empty response slice.").strip()
    except requests.exceptions.ConnectionError:
        return "Error: Ollama background engine is not responding. Please check if 'ollama serve' is running."
    except Exception as e:
        return f"Pipeline Error: {str(e)}"

def generate_llm_response(user_query, grid_id=None, provider="ollama"):
    if provider == "ollama":
        return generate_llm_response_ollama(user_query, grid_id)
    return f"Unsupported engine configuration: {provider}"

if __name__ == "__main__":
    # Test using a natural sentence with a location name instead of a technical grid ID!
    test_query = "What is the air quality and its reasons in Rohini?"
    
    print("\n" + "="*60)
    print(f"Testing Natural Language Query Pipeline...")
    print("="*60)
    
    answer = generate_llm_response(test_query, grid_id=None, provider="ollama")
    print(f"\nUser: {test_query}")
    print(f"Bot: {answer}\n")