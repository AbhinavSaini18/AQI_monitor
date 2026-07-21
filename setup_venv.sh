#!/bin/bash
set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$PROJECT_DIR/.venv"

echo "============================================="
echo "🚀 Initializing AQI Platform Virtual Environment"
echo "============================================="

if [ -d "$VENV_DIR" ]; then
    echo "🧹 Removing old virtual environment..."
    rm -rf "$VENV_DIR"
fi

echo "📦 Creating fresh virtual environment (.venv)..."
python3 -m venv .venv

echo "🔌 Activating virtual environment..."
source .venv/bin/activate

echo "⚙️ Upgrading foundational package managers..."
pip install --upgrade pip setuptools wheel

# Look for requirements inside the AQI_monitor subdirectory
if [ -f "$PROJECT_DIR/AQI_monitor/requirements.txt" ]; then
    echo "📥 Installing project dependencies..."
    pip install -r "$PROJECT_DIR/AQI_monitor/requirements.txt"
    echo "✅ Python libraries installed successfully!"
else
    echo "⚠️ requirements.txt not found in AQI_monitor/ folder."
fi

echo "============================================="
echo "🎉 Setup Complete! Next steps:"
echo "1. Run: source .venv/bin/activate"
echo "2. Copy .env.example to .env and configure it."
echo "============================================="
