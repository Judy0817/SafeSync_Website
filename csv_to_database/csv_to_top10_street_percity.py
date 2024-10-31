import pandas as pd
import psycopg2
from psycopg2 import sql

# Read the CSV file for top 10 streets per city
csv_file = 'top_10_streets_per_city.csv'
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

# Create table for top 10 streets per city if it does not exist
create_table_query = '''
CREATE TABLE IF NOT EXISTS top_10_streets_per_city (
    city VARCHAR(255),
    street VARCHAR(255),
    accident_count INT,
    PRIMARY KEY (city, street)
)
'''
cur.execute(create_table_query)
conn.commit()

# Insert data into the table
insert_query = '''
INSERT INTO top_10_streets_per_city (city, street, accident_count)
VALUES (%s, %s, %s)
ON CONFLICT (city, street) DO NOTHING
'''

for index, row in data.iterrows():
    cur.execute(insert_query, (row['City'], row['Street'], row['Accident_Count']))

# Commit the transaction
conn.commit()

# Close the cursor and connection
cur.close()
conn.close()

print("Data has been successfully inserted into the PostgreSQL database.")
