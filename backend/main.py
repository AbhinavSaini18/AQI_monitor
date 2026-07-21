
from fastapi import FastAPI
from pydantic import BaseModel  # <-- Add this import
from db import get_connection
import requests
from fastapi.middleware.cors import CORSMiddleware

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
class ChatRequest(BaseModel):
    grid_id: str
    question: str

#Status Checker
@app.get("/")
def root():
    return {"status": "AQI API is running"}

# ... keep the rest of your endpoints exactly as they are ...
#Status Checker
@app.get("/")
def root():
    return {"status": "AQI API is running"}

#Grid data
@app.get("/grid")
def get_grid():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT grid_id, grid_x, grid_y, ST_AsGeoJSON(ST_Transform(grid_polygon, 4326))
        FROM city_1km_grid
        LIMIT 5;
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
        ORDER BY grid_id, target_timestamp DESC
        LIMIT 5;
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

@app.post("/chat")
def chat(request: ChatRequest):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT predicted_aqi, source_attribution, target_timestamp
        FROM ai_predictions
        WHERE grid_id = %s
        ORDER BY target_timestamp DESC
        LIMIT 1;
    """, (request.grid_id,))
    row = cur.fetchone()
    cur.close()
    conn.close()

    if row is None:
        context_text = "No prediction data available for this grid cell yet."
    else:
        predicted_aqi, source_attribution, target_timestamp = row
        context_text = (
            f"Predicted AQI: {predicted_aqi}\n"
            f"Forecast time: {target_timestamp}\n"
            f"Source attribution: {source_attribution}"
        )

    system_prompt = f"""You are an air quality assistant for Delhi.
[GROUNDING DATA]
{context_text}

INSTRUCTION: Answer using only the grounding data above. Do not invent numbers not listed here."""

    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "mistral",
                "prompt": f"{system_prompt}\n\nUser Question: {request.question}\nAnswer:",
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