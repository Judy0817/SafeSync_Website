import pandas as pd
import psycopg2
from psycopg2 import sql

# Read the CSV file
csv_file = 'top_20_streets_by_accidents.csv'
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
CREATE TABLE IF NOT EXISTS top_street (
    street VARCHAR(255) UNIQUE,
    accident_count INT
)
'''
cur.execute(create_table_query)
conn.commit()

# Insert data into the table
insert_query = '''
INSERT INTO top_street (street, accident_count)
VALUES (%s, %s)
'''

for index, row in data.iterrows():
    cur.execute(insert_query, (row['Street'], row['accident_count']))  # Use 'Street' and 'Accident_Count'

# Commit the transaction
conn.commit()

# Close the cursor and connection
cur.close()
conn.close()

print("Data has been successfully inserted into the PostgreSQL database.")
