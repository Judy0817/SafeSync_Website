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
for street_city_county, features in data.items():
    # Ensure the correct format before splitting
    parts = street_city_county.split(", ")
    
    if len(parts) != 3:
        print(f"Skipping invalid entry: {street_city_county}")
        continue
    
    street_name, city_name, county_name = parts
    
    # Debugging: print the values before inserting them
    print(f"Inserting: {street_name}, {city_name}, {county_name}, {features}")

    # Debugging: Check the length of features
    print(f"Features: {features}")
    
    # Ensure the features dictionary has the expected keys
    required_keys = ["Bump", "Crossing", "Give_Way", "Junction", "No_Exit", 
                     "Railway", "Roundabout", "Station", "Stop", "Traffic_Calming", 
                     "Traffic_Signal", "Average_Severity"]
    
    if not all(key in features for key in required_keys):
        print(f"Missing keys for street: {street_city_county}")
        continue
    
    try:
        cursor.execute("""
            INSERT INTO road_features_with_severity (
                street_name, city_name, county_name, bump, crossing, give_way, junction, no_exit,
                railway, roundabout, station, stop, traffic_calming,
                traffic_signal, average_severity
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            street_name,
            city_name,
            county_name,
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
    except Exception as e:
        print(f"Error inserting data for {street_city_county}: {e}")

# Commit and close the connection
conn.commit()
cursor.close()
conn.close()

print("Data inserted successfully!")
