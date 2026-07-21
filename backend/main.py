
from fastapi import FastAPI
from pydantic import BaseModel  # <-- Add this import
from db import get_connection
import requests
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from geopy.geocoders import Nominatim
import re
# Initialize geocoder (user agent can be your app name)
geolocator = Nominatim(user_agent="aqi_monitor_app")
# ... your existing app = FastAPI() line ...

# Add this block to allow your frontend to talk to your backend

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (good for local development)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)


#Status Checker
@app.get("/")
def root():
    return {"status": "AQI API is running"}

# ... keep the rest of your endpoints exactly as they are ...
#Status Checker

#Grid data
#Grid data
@app.get("/grid")
def get_grid():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT grid_id, grid_x, grid_y, ST_AsGeoJSON(ST_Transform(grid_polygon, 4326))
        FROM city_1km_grid;
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return [
        {"grid_id": r[0], "grid_x": r[1], "grid_y": r[2], "geometry": r[3]}
        for r in rows
    ]

#Get latest ai predictions needs to be fixed
@app.get("/predictions/heatmap")
def get_heatmap():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT DISTINCT ON (grid_id) grid_id, predicted_aqi, target_timestamp
        FROM ai_predictions
        ORDER BY grid_id, target_timestamp DESC;
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return [
        {"grid_id": r[0], "predicted_aqi": r[1], "target_timestamp": r[2]}
        for r in rows
    ]
#needs to be fixed
@app.get("/predictions/{grid_id}")
def get_prediction_detail(grid_id: str):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT target_timestamp, predicted_aqi, confidence_score
        FROM ai_predictions
        WHERE grid_id = %s
        ORDER BY target_timestamp;
    """, (grid_id,))
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return [
        {"target_timestamp": r[0], "predicted_aqi": r[1], "confidence_score": r[2]}
        for r in rows
    ]

@app.get("/attribution/{grid_id}")
def get_attribution(grid_id: str):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT source_attribution, target_timestamp
        FROM ai_predictions
        WHERE grid_id = %s
        ORDER BY target_timestamp DESC
        LIMIT 1;
    """, (grid_id,))
    row = cur.fetchone()
    cur.close()
    conn.close()

    if row is None:
        return {"grid_id": grid_id, "attribution": None, "message": "No attribution data yet"}

    return {
        "grid_id": grid_id,
        "attribution": row[0],
        "target_timestamp": row[1]
    }


# 1. Update Request Schema to accept a single natural message
class ChatRequest(BaseModel):
    message: str

def extract_location(text: str):
    """Dynamically extracts a location name from any natural sentence structure."""
    text_lower = text.lower()
    
    # Matches prepositions like "in", "at", "for", "near" followed by place names
    match = re.search(r'\b(?:in|at|for|near|of)\s+([a-zA-Z\s]+?)(?:\?|\.|,|$)', text_lower)
    if match:
        place = match.group(1).strip()
        # Clean out common filler words if captured
        place = re.sub(r'\b(right now|today|tomorrow|aqi|air quality|the)\b', '', place).strip()
        if place:
            return place.title()
            
    return None

@app.post("/chat")
def chat(request: ChatRequest):
    user_text = request.message
    detected_place = extract_location(user_text)
    target_grid_id = None

    conn = get_connection()
    cur = conn.cursor()

    # If a location name was found inside the sentence, find its grid via PostGIS
    if detected_place:
        try:
            location = geolocator.geocode(detected_place + ", Delhi, India")
            if location:
                lat, lon = location.latitude, location.longitude
                spatial_query = """
                    SELECT grid_id FROM city_1km_grid 
                    WHERE ST_Contains(grid_polygon, ST_SetSRID(ST_MakePoint(%s, %s), 4326))
                    LIMIT 1;
                """
                cur.execute(spatial_query, (lon, lat))
                row = cur.fetchone()
                if row:
                    target_grid_id = row[0]
        except Exception as e:
            print(f"Geocoding / Spatial error: {e}")

    # Fallback if no location name was mentioned in the sentence
    if not target_grid_id:
        cur.execute("SELECT grid_id FROM ai_predictions ORDER BY target_timestamp DESC LIMIT 1;")
        row = cur.fetchone()
        target_grid_id = row[0] if row else "grid_679_3146"

    # Fetch predictions for the resolved grid_id
    cur.execute("""
        SELECT predicted_aqi, source_attribution, target_timestamp
        FROM ai_predictions
        WHERE grid_id = %s
        ORDER BY target_timestamp DESC
        LIMIT 1;
    """, (target_grid_id,))
    row = cur.fetchone()
    cur.close()
    conn.close()

    if row is None:
        context_text = f"No prediction data available for this sector."
    else:
        predicted_aqi, source_attribution, target_timestamp = row
        context_text = (
            f"Location/Grid: {target_grid_id}\n"
            f"Predicted AQI: {predicted_aqi}\n"
            f"Forecast time: {target_timestamp}\n"
            f"Source attribution: {source_attribution}"
        )

    system_prompt = f"""You are an air quality assistant for Delhi.
[GROUNDING DATA]
{context_text}

INSTRUCTION: Answer using only the grounding data above. Do not invent numbers or locations not listed here."""

    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "mistral",
                "prompt": f"{system_prompt}\n\nUser Question: {user_text}\nAnswer:",
                "stream": False,
                "options": {"temperature": 0.2}
            },
            timeout=45
        )
        response.raise_for_status()
        answer = response.json().get("response", "Model returned no answer.").strip()
    except requests.exceptions.ConnectionError:
        answer = "Ollama isn't responding — make sure 'ollama serve' is running."
    except Exception as e:
        answer = f"Error generating response: {str(e)}"

    return {"answer": answer}