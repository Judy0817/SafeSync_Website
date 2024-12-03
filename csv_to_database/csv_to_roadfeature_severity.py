import pandas as pd
import psycopg2
from psycopg2 import sql

# Read the CSV file for road feature accident data
csv_file = 'accidents_by_severity_and_road_feature.csv'  # Update this with your actual CSV file name
data = pd.read_csv(csv_file)

# Database connection parameters
db_params = {
    'host': 'localhost',
    'database': 'road_db',
    'user': 'postgres',
    'password': 'Judy@0817'
}

# Connect to the PostgreSQL database
conn = psycopg2.connect(**db_params)
cur = conn.cursor()

# Insert data into the table
insert_query = '''
INSERT INTO road_feature_accidents_by_severity (road_feature, severity_1, severity_2, severity_3, severity_4)
VALUES (%s, %s, %s, %s, %s)
ON CONFLICT (road_feature) DO UPDATE SET
    severity_1 = EXCLUDED.severity_1,
    severity_2 = EXCLUDED.severity_2,
    severity_3 = EXCLUDED.severity_3,
    severity_4 = EXCLUDED.severity_4
'''

# Iterate over the DataFrame rows and insert each row into the table
for index, row in data.iterrows():
    cur.execute(insert_query, (
        row['road_feature'], 
        row['1'],  # Severity level 1
        row['2'],  # Severity level 2
        row['3'],  # Severity level 3
        row['4']   # Severity level 4
    ))

# Commit the transaction
conn.commit()

# Close the cursor and connection
cur.close()
conn.close()

print("Data has been successfully inserted into the PostgreSQL database.")
