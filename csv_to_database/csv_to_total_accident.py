import pandas as pd
import psycopg2
from psycopg2 import sql

# Load the CSV file containing total accidents per year
csv_file = 'total_accidents_per_year_2016_2023.csv'  # Update with your CSV file name
data = pd.read_csv(csv_file)

# Check the loaded data
print("Loaded data from CSV:")
print(data)

# Database connection parameters
db_params = {
    'host': 'localhost',
    'database': 'accident_dashboard',
    'user': 'postgres',
    'password': 'Judy@0817'
}

try:
    # Connect to the PostgreSQL database
    conn = psycopg2.connect(**db_params)
    cur = conn.cursor()

    # Create table if it does not exist
    create_table_query = '''
    CREATE TABLE IF NOT EXISTS total_accidents (
        year INT PRIMARY KEY,
        count INT
    )
    '''
    cur.execute(create_table_query)
    conn.commit()
    print("Table created or already exists.")

    # Insert data into the table
    insert_query = '''
    INSERT INTO total_accidents (year, count)
    VALUES (%s, %s)
    ON CONFLICT (year) DO UPDATE SET count = EXCLUDED.count;
    ''' 

    # Prepare data for insertion
    for index, row in data.iterrows():
        year = row['Year']  # Change 'Year' to the column name in your CSV
        count = row['count']  # Change 'count' to the column name in your CSV
        cur.execute(insert_query, (year, count))
    
    # Commit the transaction
    conn.commit()
    print("Data has been successfully inserted into the PostgreSQL database.")

except Exception as e:
    print(f"An error occurred: {e}")

finally:
    # Close the cursor and connection
    if 'cur' in locals():
        cur.close()
    if 'conn' in locals():
        conn.close()
    print("Database connection closed.")
