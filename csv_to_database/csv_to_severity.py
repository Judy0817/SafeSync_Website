import pandas as pd
import psycopg2

# Step 1: Read the CSV file and calculate the severity distribution
csv_file = 'severity_distribution.csv'  # Replace with your actual CSV file path
data = pd.read_csv(csv_file)

# Step 2: Database connection parameters
db_params = {
    'host': 'localhost',
    'database': 'accident_dashboard',
    'user': 'postgres',
    'password': 'Judy@0817'
}

# Step 3: Connect to the PostgreSQL database
conn = psycopg2.connect(**db_params)
cur = conn.cursor()

# Step 4: Create table if it does not exist
create_table_query = '''
CREATE TABLE IF NOT EXISTS severity_distribution (
    severity VARCHAR(255) UNIQUE,
    count INT
)
'''
cur.execute(create_table_query)
conn.commit()

# Step 5: Insert data into the table
insert_query = '''
INSERT INTO severity_distribution (severity, count)
VALUES (%s, %s)
'''

# Iterate over each row and insert data into the database
for index, row in data.iterrows():
    severity = str(row['Severity'])  # Ensure severity is a string
    count = int(row['Count'])  # Ensure count is an int
    print(f"Inserting: Severity={severity} (type={type(severity)}), Count={count} (type={type(count)})")
    cur.execute(insert_query, (severity, count))

# Commit the transaction
conn.commit()

# Close the cursor and connection
cur.close()
conn.close()

print("Severity distribution data has been successfully inserted into the PostgreSQL database.")
