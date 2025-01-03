import pandas as pd
import psycopg2
from psycopg2 import sql

# Read the CSV file for 2019 data
csv_file_2021 = 'accidents_2021.csv'
data_2021 = pd.read_csv(csv_file_2021)

# Database connection parameters
db_params = {
    'host': 'localhost',
    'database': 'time_db',
    'user': 'postgres',
    'password': 'Judy@0817'
}

# Connect to the PostgreSQL database
conn = psycopg2.connect(**db_params)
cur = conn.cursor()

# Insert data into the 2019 table
insert_query_2021 = '''
INSERT INTO accidents_2021 (month, accidents)
VALUES (%s, %s)
'''

for index, row in data_2021.iterrows():
    cur.execute(insert_query_2021, (str(row['YearMonth']), int(row['Accidents'])))

# Commit the transaction
conn.commit()

# Close the cursor and connection
cur.close()
conn.close()

print("2021 data has been successfully inserted into the PostgreSQL database.")
