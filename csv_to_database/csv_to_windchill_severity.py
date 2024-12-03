import pandas as pd
import psycopg2
from psycopg2 import sql

csv_file = 'wind_speed_time_of_day_severity.csv'
data = pd.read_csv(csv_file)

# Convert the dictionary to a DataFrame
df = pd.DataFrame(data)

# Calculate average wind speed grouped by Time_of_Day and Severity
avg_wind_speed = df.groupby(['Time_of_Day', 'Severity'], as_index=False).agg({'Wind_Speed(mph)': 'mean'})
avg_wind_speed.rename(columns={'Wind_Speed(mph)': 'Average_Wind_Speed'}, inplace=True)

# Database connection parameters
db_params = {
    'host': 'localhost',
    'database': 'weather_db',
    'user': 'postgres',
    'password': 'Judy@0817'
}

# Connect to the PostgreSQL database
conn = psycopg2.connect(**db_params)
cur = conn.cursor()


# Insert average wind speed data into the table
insert_query = '''
INSERT INTO average_wind_speed_data (time_of_day, severity, average_wind_speed)
VALUES (%s, %s, %s)
ON CONFLICT (time_of_day, severity) DO NOTHING
'''

for index, row in avg_wind_speed.iterrows():
    cur.execute(insert_query, (row['Time_of_Day'], row['Severity'], row['Average_Wind_Speed']))

# Commit the transaction
conn.commit()

# Close the cursor and connection
cur.close()
conn.close()

print("Average wind speed data has been successfully inserted into the PostgreSQL database.")
