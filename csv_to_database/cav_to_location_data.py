import pandas as pd
import psycopg2
from psycopg2 import sql

# Example accident data
csv_file = 'latitude_accident_data_filtered.csv'  # Update with your actual CSV file name
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

# Drop the table if it exists
drop_table_query = 'DROP TABLE IF EXISTS accident_data_location'
cur.execute(drop_table_query)
conn.commit()

# Create a table for accident data
create_table_query = '''
CREATE TABLE accident_data_location (
    latitude FLOAT,
    longitude FLOAT,
    city TEXT,
    country TEXT,
    street TEXT,
    no_of_accidents INT,
    PRIMARY KEY (latitude, longitude, street)  -- Combined primary key for latitude, longitude, and street
)
'''
cur.execute(create_table_query)
conn.commit()

# Insert data into the table
insert_query = '''
INSERT INTO accident_data_location (latitude, longitude, city, country, street, no_of_accidents)
VALUES (%s, %s, %s, %s, %s, %s)
ON CONFLICT (latitude, longitude, street) DO UPDATE 
SET no_of_accidents = EXCLUDED.no_of_accidents
'''

# Loop over each row in the DataFrame and insert it into the database
for index, row in data.iterrows():
    cur.execute(insert_query, (row['latitude'], row['longitude'], row['city'], row['country'], row['street'], row['no_of_accidents']))

# Commit the transaction
conn.commit()

# Close the cursor and connection
cur.close()
conn.close()

print("Data has been successfully inserted into the PostgreSQL database.")
