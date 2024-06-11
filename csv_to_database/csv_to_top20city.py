import pandas as pd
import psycopg2
from psycopg2 import sql

# Read the CSV file
csv_file = 'top20_cities_by_accidents.csv'
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

# Create table if it does not exist
create_table_query = '''
CREATE TABLE IF NOT EXISTS top_city (
    city VARCHAR(255) UNIQUE,
    accident_count INT
)
'''
cur.execute(create_table_query)
conn.commit()

# Insert data into the table
insert_query = '''
INSERT INTO top_city (city, accident_count)
VALUES (%s, %s)
'''

for index, row in data.iterrows():
    cur.execute(insert_query, (row['City'], row['Accident_Count']))  # Use 'City' and 'Accident_Count'

# Commit the transaction
conn.commit()

# Close the cursor and connection
cur.close()
conn.close()

print("Data has been successfully inserted into the PostgreSQL database.")
