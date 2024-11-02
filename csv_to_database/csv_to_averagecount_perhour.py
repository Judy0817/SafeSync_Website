import pandas as pd
import psycopg2
from psycopg2 import sql

# Read the CSV file for day-wise accident counts
csv_file = 'average_accident_count_per_hour.csv'
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
drop_table_query = 'DROP TABLE IF EXISTS average_count_perhour'
cur.execute(drop_table_query)
conn.commit()

# Create table for day-wise accident counts if it does not exist
create_table_query = '''
CREATE TABLE average_count_perhour (
    day VARCHAR(50),
    hour FLOAT,
    accident_count FLOAT,
    PRIMARY KEY (day, hour)  -- Combined primary key for day and hour
)
'''
cur.execute(create_table_query)
conn.commit()

# Insert data into the table
insert_query = '''
INSERT INTO average_count_perhour (day, hour, accident_count)
VALUES (%s, %s, %s)
ON CONFLICT (day, hour) DO UPDATE 
SET accident_count = EXCLUDED.accident_count
'''

# Loop over each row in the DataFrame and insert it into the database
for index, row in data.iterrows():
    cur.execute(insert_query, (row['day'], row['hour'], row['accident_count']))

# Commit the transaction
conn.commit()

# Close the cursor and connection
cur.close()
conn.close()

print("Data has been successfully inserted into the PostgreSQL database.")