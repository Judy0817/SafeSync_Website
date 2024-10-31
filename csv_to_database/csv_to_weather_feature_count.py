import pandas as pd
import psycopg2
from psycopg2 import sql

# Read the CSV file for weather feature accident counts
csv_file = 'weather_feature_accident_counts.csv'
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

# Create table for weather feature accident counts if it does not exist
create_table_query = '''
CREATE TABLE IF NOT EXISTS weather_feature_accident_counts (
    weather_feature VARCHAR(255),
    all_values VARCHAR(255),
    count INT,
    PRIMARY KEY (weather_feature, all_values)
)
'''
cur.execute(create_table_query)
conn.commit()

# Insert data into the table
insert_query = '''
INSERT INTO weather_feature_accident_counts (weather_feature, all_values, count)
VALUES (%s, %s, %s)
ON CONFLICT (weather_feature, all_values) DO NOTHING
'''

for index, row in data.iterrows():
    cur.execute(insert_query, (row['weather_feature'], row['all_values'], row['count']))

# Commit the transaction
conn.commit()

# Close the cursor and connection
cur.close()
conn.close()

print("Data has been successfully inserted into the PostgreSQL database.")
