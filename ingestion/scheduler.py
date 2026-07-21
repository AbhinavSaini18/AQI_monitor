import subprocess
from apscheduler.schedulers.blocking import BlockingScheduler
from datetime import datetime
import os
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent

def run_script(script_name):
    print(f"[{datetime.now()}] Starting {script_name}...")
    script_path = SCRIPT_DIR / script_name
    subprocess.run(["python", str(script_path)])
    print(f"[{datetime.now()}] Finished {script_name}\n")
def run_all_workers():
    print(f"--- BATCH RUN STARTED: {datetime.now()} ---")
    run_script("ingest_aqicn.py")
    run_script("ingest_weather.py")
    run_script("ingest_traffic.py")
    run_script("ingest_fires.py")
    print("--- BATCH RUN COMPLETE ---\n")

if __name__ == "__main__":
    # BlockingScheduler runs continuously and blocks the terminal from doing anything else
    scheduler = BlockingScheduler()
    
    # Schedule the run_all_workers function to trigger every 1 hour
    scheduler.add_job(run_all_workers, 'interval', hours=1)
    
    print("Scheduler initialized. Running first batch immediately...")
    run_all_workers() # Run it once right now so we don't have to wait an hour
    
    print("Now waiting for the next scheduled run. Press Ctrl+C to stop.")
    scheduler.start()