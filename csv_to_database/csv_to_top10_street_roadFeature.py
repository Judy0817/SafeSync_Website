import pandas as pd
import psycopg2
from psycopg2 import sql

# Read the CSV file for road feature accident data
csv_file = 'top_10_streets_road_features.csv'
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

# Create table for road feature accidents if it does not exist
create_table_query = '''
CREATE TABLE IF NOT EXISTS road_feature_accidents_By_Street (
    street VARCHAR(50) PRIMARY KEY,
    crossing INT,
    give_way INT,
    junction INT,
    railway INT,
    stop INT,
    traffic_signal INT
)
'''
cur.execute(create_table_query)
conn.commit()

# Insert data into the table
insert_query = '''
INSERT INTO road_feature_accidents_By_Street (street, crossing, give_way, junction, railway, stop, traffic_signal)
VALUES (%s, %s, %s, %s, %s, %s, %s)
ON CONFLICT (street) DO NOTHING
'''

# Iterate over the DataFrame rows and insert each row into the table
for index, row in data.iterrows():
    cur.execute(insert_query, (
        row['Street'], 
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
