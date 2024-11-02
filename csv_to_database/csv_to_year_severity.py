import pandas as pd
import psycopg2
from psycopg2 import sql

# Read the CSV file with accident severity data
csv_file = 'accidents_by_year_severity.csv'  # Update with your actual CSV file name
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
drop_table_query = 'DROP TABLE IF EXISTS accident_severity_counts'
cur.execute(drop_table_query)
conn.commit()

# Create a table for accident severity counts
create_table_query = '''
CREATE TABLE accident_severity_counts (
    year FLOAT,
    severity FLOAT,
    number_of_accidents FLOAT,
    PRIMARY KEY (year, severity)  -- Combined primary key for year and severity
)
'''
cur.execute(create_table_query)
conn.commit()

# Insert data into the table
insert_query = '''
INSERT INTO accident_severity_counts (year, severity, number_of_accidents)
VALUES (%s, %s, %s)
ON CONFLICT (year, severity) DO UPDATE 
SET number_of_accidents = EXCLUDED.number_of_accidents
'''

# Loop over each row in the DataFrame and insert it into the database
for index, row in data.iterrows():
    cur.execute(insert_query, (row['Year'], row['Severity'], row['Number_of_Accidents']))

# Commit the transaction
conn.commit()

# Close the cursor and connection
cur.close()
conn.close()

print("Data has been successfully inserted into the PostgreSQL database.")
