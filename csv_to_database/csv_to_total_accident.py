import pandas as pd
import psycopg2

# Load the CSV file containing total accidents per year
csv_file = 'total_accidents_per_year_2016_2023.csv'  # Update with your CSV file name
try:
    data = pd.read_csv(csv_file)
except FileNotFoundError:
    print(f"Error: The file {csv_file} was not found.")
    exit()

# Database connection parameters
db_params = {
    'host': 'localhost',
    'database': 'location_db',
    'user': 'postgres',
    'password': 'Judy@0817'
}

try:
    # Connect to the PostgreSQL database
    conn = psycopg2.connect(**db_params)
    cur = conn.cursor()

    # Insert query with conflict handling
    insert_query = '''
    INSERT INTO total_accidents (year, count)
    VALUES (%s, %s)
    ON CONFLICT (year) DO UPDATE SET count = EXCLUDED.count;
    '''

    # Prepare the data as a list of tuples
    rows_to_insert = list(data.itertuples(index=False, name=None))
   
    # Execute the bulk insert
    cur.executemany(insert_query, rows_to_insert)

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
