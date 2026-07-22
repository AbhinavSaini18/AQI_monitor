import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

try:
    conn = psycopg2.connect(dbname='postgres', user='postgres', password='password', host='localhost')
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cur = conn.cursor()
    try:
        cur.execute("CREATE ROLE admin WITH LOGIN PASSWORD '1234'")
        print("Role admin created.")
    except Exception as e:
        print("Role creation failed (maybe exists?):", e)
    
    try:
        cur.execute('CREATE DATABASE "Aqi_monitor" OWNER admin')
        print("Database Aqi_monitor created.")
    except Exception as e:
        print("Database creation failed (maybe exists?):", e)
        
    cur.close()
    conn.close()
except Exception as e:
    print("Connection failed:", e)
