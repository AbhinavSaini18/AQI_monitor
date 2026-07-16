# 🌍 Oorja AQI Monitoring & Forecasting Platform

An end-to-end local air quality forecasting engine using **XGBoost Regressors** for multi-horizon predictions, grounded via a local **Ollama RAG (Mistral)** LLM pipeline.

---

## 🛠️ Step 1: System-Level Prerequisites (Crucial)

Before configuring Python, your machine requires the native PostgreSQL development files to successfully compile the database adapter interface:

```bash
sudo apt-get update
sudo apt-get install -y libpq-dev build-essential
```

---

## 🚀 Step 2: Environment Initialization

1. Clone the repository and navigate to the project root directory.
2. Run the automated environment setup tool script to spin up an isolated environment sandbox:
   ```bash
   ./setup_venv.sh
   ```
3. Activate the virtual environment context loop:
   ```bash
   source .venv/bin/activate
   ```

---

## 🔑 Step 3: Configuration Setup

1. Copy the environment variables setup framework template:
   ```bash
   cp AQI_monitor/.env.example AQI_monitor/.env
   ```
2. Open `AQI_monitor/.env` and fill in your local PostgreSQL cluster parameters.

---

## 🤖 Step 4: Local Model Initialization (Ollama)

Ensure Ollama is running locally on your hardware configuration layer:

```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull mistral
```

---

## 🏃‍♂️ Step 5: Running the End-to-End Workspace Pipeline

To generate feature matrices, run the ML predictions, and chat with your local data agent, execute the components in this specific sequence order:

```bash
# 1. Generate features & push fresh XGBoost forecasts to the database
cd AQI_monitor/ml
python3 run_pipeline.py

# 2. Fire up the local Grounded RAG AI Chat assistant interface
cd rag
python3 chat_pipeline.py
```
