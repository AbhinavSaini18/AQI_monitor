import psycopg2
import json
import os
from openai import OpenAI

# Database Connection Map
DB_CONFIG = {
    "dbname": "oorja_aqi",
    "user": "postgres",
    "password": "your_secure_password",
    "host": "localhost",
    "port": 5432
}

# Initialize your target LLM client 
# (Can point to local Ollama/Llama-3 instances by changing base_url)
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY", "your_mock_or_real_key"))

def fetch_grid_intelligence_context(grid_id):
    """
    Queries the database serving layer to isolate spatial realities.
    Strictly extracts numerical targets without live computations.
    """
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    # Isolate the exact analytical matrix rows populated by Module 3
    query = """
        SELECT target_timestamp, predicted_aqi, source_attribution, confidence_score
        FROM ai_predictions
        WHERE grid_id = %s
        ORDER BY target_timestamp ASC
        LIMIT 3;
    """
    cursor.execute(query, (grid_id,))
    prediction_records = cursor.fetchall()
    
    cursor.close()
    conn.close()
    return prediction_records

def generate_urban_intervention_brief(grid_id, user_query):
    """
    Fuses target database predictions with hard prompt guardrails 
    to output plain-language urban advisory insights.
    """
    # 1. Fetch data context from the database finish line
    raw_context = fetch_grid_intelligence_context(grid_id)
    
    if not raw_context:
        return f"System Alert: No localized machine learning forecast records found in the serving hub for zone {grid_id}."
        
    # 2. Format the database matrix rows into an immutable string block
    formatted_data = f"--- REAL-TIME PREDICTIVE ANALYTICS FOR CELL SCHEMA: {grid_id} ---\n"
    for row in raw_context:
        timestamp, aqi, attribution, confidence = row
        # Ensure attribution parsing safely maps JSON data payloads
        attr_dict = json.loads(attribution) if isinstance(attribution, str) else attribution
        
        formatted_data += f"• Horizon Target Time: {timestamp}\n"
        formatted_data += f"  - Model Forecasted AQI: {aqi}\n"
        formatted_data += f"  - Source Breakdown: Traffic={attr_dict.get('traffic', 0)}%, Industrial={attr_dict.get('industrial', 0)}%, Crop Burning={attr_dict.get('crop_burning', 0)}%, Other={attr_dict.get('other', 0)}%\n"
        formatted_data += f"  - Forecast Confidence Index: {float(confidence) * 100:.1f}%\n"

    # 3. Construct the strict, authoritative system prompt architecture
    system_prompt = f"""
    You are the Senior Urban Environmental Intelligence Co-Pilot for a Smart City Command & Control Centre.
    Your objective is to translate raw spatial-temporal matrix inputs into clear, definitive, plain-English insights.

    [CRITICAL DATA BOUNDS]
    You must rely EXCLUSIVELY on the injected numerical facts below. 
    Never invent tracking details, do not hallucinate metrics, and do not perform any manual mathematical operations. 
    If asked about trends not present in this data, state that the platform metrics are unavailable.

    [GROUND-TRUTH MATRIX INPUTS]
    {formatted_data}

    [OUTPUT STYLE GUIDE]
    - Speak directly, professionally, and clearly.
    - If the user is an administrator, highlight the dominant pollution source vector and explicitly mention immediate actionable enforcement deployments (e.g., dispatching road sweepers, inspecting upwind construction spots, scaling down industrial throughput).
    - If the user is a citizen, provide a concise public health precaution.
    """

    # 4. Fire the inference request payload
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini", # Switch to "llama3" if running on a local inference server loop
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_query}
            ],
            temperature=0.2, # Keep low to prevent loose text variations or hallucinations
            max_tokens=400
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Inference Transmission Halted: {str(e)}\n\n[Fallback Data Dump]\n{formatted_data}"

if __name__ == "__main__":
    # Test your RAG module using the verified data rows you just loaded
    target_test_grid = "grid_2_2"
    sample_admin_question = "Explain the pollution sources for this grid cell and give me a clear mitigation task recommendation."
    
    print(f"Executing RAG assistant test loop for {target_test_grid}...")
    brief_output = generate_urban_intervention_brief(target_test_grid, sample_admin_question)
    
    print("\n=== GENERATED AI INTELLIGENCE BRIEF ===")
    print(brief_output)