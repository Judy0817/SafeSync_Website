import pandas as pd
import psycopg2
from psycopg2 import sql

# Read the CSV file
csv_file = 'road_features_percentages.csv'
data = pd.read_csv(csv_file)

# Database connection parameters
db_params = {
    'host': 'localhost',
    'database': 'road_db',
    'user': 'postgres',
    'password': 'Judy@0817'
}

# Connect to the PostgreSQL database
conn = psycopg2.connect(**db_params)
cur = conn.cursor()

# Insert data into the table
insert_query = '''
INSERT INTO road_features (feature, percentage)
VALUES (%s, %s)
'''

for index, row in data.iterrows():
    cur.execute(insert_query, (row['Feature'], row['Percentage']))

# Commit the transaction
conn.commit()

# Close the cursor and connection
cur.close()
conn.close()

print("Data has been successfully inserted into the PostgreSQL database.")
 