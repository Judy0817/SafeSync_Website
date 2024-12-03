import pandas as pd
import psycopg2
from psycopg2 import sql

# Read the CSV file with accident severity data
csv_file = 'accidents_by_year_severity.csv'  # Update with your actual CSV file name
data = pd.read_csv(csv_file)

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

# Insert data into the table
insert_query = '''
INSERT INTO accident_severity_counts (year, severity, number_of_accidents)
VALUES (%s, %s, %s)
ON CONFLICT (year, severity) DO UPDATE 
SET number_of_accidents = EXCLUDED.number_of_accidents
'''

# Loop over each row in the DataFrame and insert it into the database
for index, row in data.iterrows():
    # Convert numpy types to native Python types
    year = int(row['Year'])  # Convert to Python int
    severity = int(row['Severity'])  # Convert to Python int
    number_of_accidents = int(row['Number_of_Accidents'])  # Convert to Python int

    # Execute the query with converted data
    cur.execute(insert_query, (year, severity, number_of_accidents))

# Commit the transaction
conn.commit()

# Close the cursor and connection
cur.close()
conn.close()

print("Data has been successfully inserted into the PostgreSQL database.")
