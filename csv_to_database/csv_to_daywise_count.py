import pandas as pd
import psycopg2
from psycopg2 import sql

# Read the CSV file for day-wise accident counts
csv_file = 'daywise_accident_counts.csv'
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

# Create table for day-wise accident counts if it does not exist
create_table_query = '''
CREATE TABLE IF NOT EXISTS daywise_accident_counts (
    day_name VARCHAR(50),
    day_type VARCHAR(50),
    accident_count INT,
    PRIMARY KEY (day_name)
)
'''
cur.execute(create_table_query)
conn.commit()

# Insert data into the table
insert_query = '''
INSERT INTO daywise_accident_counts (day_name, day_type, accident_count)
VALUES (%s, %s, %s)
ON CONFLICT (day_name) DO UPDATE 
SET day_type = EXCLUDED.day_type, 
    accident_count = EXCLUDED.accident_count
'''

# Loop over each row in the DataFrame and insert it into the database
for index, row in data.iterrows():
    cur.execute(insert_query, (row['day_name'], row['day_type'], row['Accident_Count']))

# Commit the transaction
conn.commit()

# Close the cursor and connection
cur.close()
conn.close()

print("Data has been successfully inserted into the PostgreSQL database.")