import pandas as pd
import psycopg2
from psycopg2 import sql

# Read the CSV file for road feature accident data
csv_file = 'top_10_cities_road_features.csv'
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
INSERT INTO road_feature_accidents (city, crossing, give_way, junction, railway, stop, traffic_signal)
VALUES (%s, %s, %s, %s, %s, %s, %s)
ON CONFLICT (city) DO NOTHING
'''

# Iterate over the DataFrame rows and insert each row into the table
for index, row in data.iterrows():
    cur.execute(insert_query, (
        row['City'], 
        row['Crossing'], 
        row['Give_Way'], 
        row['Junction'], 
        row['Railway'], 
        row['Stop'], 
        row['Traffic_Signal']
    ))

# Commit the transaction
conn.commit()

# Close the cursor and connection
cur.close()
conn.close()

print("Data has been successfully inserted into the PostgreSQL database.")
