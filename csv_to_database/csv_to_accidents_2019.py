import pandas as pd
import psycopg2
from psycopg2 import sql

# Read the CSV file for 2019 data
csv_file_2019 = 'accidents_2019.csv'
data_2019 = pd.read_csv(csv_file_2019)

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

# Create table for 2019 data if it does not exist
create_table_query_2019 = '''
CREATE TABLE IF NOT EXISTS accidents_2019 (
    month VARCHAR(255) UNIQUE,
    accidents INT
)
'''
cur.execute(create_table_query_2019)
conn.commit()

# Insert data into the 2019 table
insert_query_2019 = '''
INSERT INTO accidents_2019 (month, accidents)
VALUES (%s, %s)
'''

for index, row in data_2019.iterrows():
    cur.execute(insert_query_2019, (str(row['YearMonth']), int(row['Accidents'])))

# Commit the transaction
conn.commit()

# Close the cursor and connection
cur.close()
conn.close()

print("2019 data has been successfully inserted into the PostgreSQL database.")