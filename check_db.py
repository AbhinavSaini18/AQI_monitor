import psycopg2
conn = psycopg2.connect(dbname="oorja_aqi", user="postgres", password="password", host="localhost")
cur = conn.cursor()
cur.execute("SELECT source_attribution FROM ai_predictions LIMIT 5")
print(cur.fetchall())
