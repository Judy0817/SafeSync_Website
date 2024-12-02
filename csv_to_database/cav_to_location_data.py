import pandas as pd
import psycopg2
from psycopg2 import sql

# Example accident data CSV file
csv_file = 'latitude_accident_data_filtered.csv'  # Update with your actual CSV file name
data = pd.read_csv(csv_file)

# Database connection parameters
db_params = {
    'host': 'localhost',
    'database': 'location_db',
    'user': 'postgres',
    'password': 'Judy@0817'
}

# Connect to the PostgreSQL database
conn = psycopg2.connect(**db_params)
cur = conn.cursor()

# Insert data into the table, including the year column
insert_query = '''
INSERT INTO accident_data_location (latitude, longitude, city, country, street, no_of_accidents, avg_severity, year)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
ON CONFLICT (latitude, longitude, street, year) DO UPDATE 
SET no_of_accidents = EXCLUDED.no_of_accidents,
    avg_severity = EXCLUDED.avg_severity
'''

# Loop over each row in the DataFrame and insert it into the database
for index, row in data.iterrows():
    # Assuming 'year' is a column in the CSV
    cur.execute(insert_query, (row['latitude'], row['longitude'], row['city'], row['country'], row['street'], row['no_of_accidents'], row['avg_severity'], row['year']))

# Commit the transaction
conn.commit()

# Close the cursor and connection
cur.close()
conn.close()

print("Data has been successfully inserted into the PostgreSQL database.")
