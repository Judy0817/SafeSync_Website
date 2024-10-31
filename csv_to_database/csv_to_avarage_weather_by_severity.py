import pandas as pd
import psycopg2
from psycopg2 import sql

# Read the CSV file for average weather conditions by severity
csv_file = 'average_weather_conditions_by_severity.csv'
data = pd.read_csv(csv_file)

# Database connection parameters
db_params = {
    'host': 'localhost',
    'database': 'accident_dashboard',
    'user': 'postgres',
    'password': 'Judy@0817'
}

# Connect to the PostgreSQL database
conn = psycopg2.connect(**db_params)
cur = conn.cursor()

# Create table for average weather conditions by severity if it does not exist
create_table_query = '''
CREATE TABLE IF NOT EXISTS average_weather_conditions_by_severity (
    severity INT PRIMARY KEY,
    temperature FLOAT,
    humidity FLOAT,
    wind_speed FLOAT,
    visibility FLOAT
)
'''
cur.execute(create_table_query)
conn.commit()

# Insert data into the table
insert_query = '''
INSERT INTO average_weather_conditions_by_severity (severity, temperature, humidity, wind_speed, visibility)
VALUES (%s, %s, %s, %s, %s)
ON CONFLICT (severity) DO NOTHING
'''

for index, row in data.iterrows():
    cur.execute(insert_query, (row['Severity'], row['Temperature(F)'], row['Humidity(%)'], row['Wind_Speed(mph)'], row['Visibility(mi)']))

# Commit the transaction
conn.commit()

# Close the cursor and connection
cur.close()
conn.close()

print("Data has been successfully inserted into the PostgreSQL database.")
