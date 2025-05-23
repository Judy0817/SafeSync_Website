import pandas as pd
import psycopg2
from psycopg2 import sql

# Read the CSV file for 2019 data
csv_file_2023 = 'accidents_2023.csv'
data_2023 = pd.read_csv(csv_file_2023)

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
insert_query_2019 = '''
INSERT INTO accidents_2023 (month, accidents)
VALUES (%s, %s)
'''

for index, row in data_2023.iterrows():
    cur.execute(insert_query_2019, (str(row['YearMonth']), int(row['Accidents'])))

# Commit the transaction
conn.commit()

# Close the cursor and connection
cur.close()
conn.close()

print("2023 data has been successfully inserted into the PostgreSQL database.")
