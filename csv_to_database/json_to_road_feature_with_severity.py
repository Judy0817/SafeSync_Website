import json
import psycopg2

# Database connection
conn = psycopg2.connect(
    host="localhost",
    database="json_db",
    user="postgres",
    password="Judy@0817"
)
cursor = conn.cursor()

# Load JSON file
with open('street_road_features_with_severity.json', 'r') as file:
    data = json.load(file)

# Insert data into the table
for street_name, features in data.items():
    cursor.execute("""
        INSERT INTO road_features_with_severity (
            street_name, bump, crossing, give_way, junction, no_exit,
            railway, roundabout, station, stop, traffic_calming,
            traffic_signal, average_severity
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        street_name,
        features.get("Bump"),
        features.get("Crossing"),
        features.get("Give_Way"),
        features.get("Junction"),
        features.get("No_Exit"),
        features.get("Railway"),
        features.get("Roundabout"),
        features.get("Station"),
        features.get("Stop"),
        features.get("Traffic_Calming"),
        features.get("Traffic_Signal"),
        features.get("Average_Severity")
    ))

# Commit and close the connection
conn.commit()
cursor.close()
conn.close()

print("Data inserted successfully!")
