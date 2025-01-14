import csv
import requests
import json
import psycopg2
from psycopg2.extras import Json

# Database connection details
db_config = {
    'host': 'localhost',
    'database': 'json_db',
    'user': 'postgres',
    'password': 'Judy@0817'
}

# Nominatim API base URL
API_BASE_URL = "https://nominatim.openstreetmap.org/search"

def get_geo_locations(street_name, city_name, county_name):
    """Fetch geo-locations for a given street, city, and county using the Nominatim API."""
    try:
        query = f"{street_name}, {city_name}, {county_name}"
        url = f"{API_BASE_URL}?q={requests.utils.quote(query)}&format=json&addressdetails=1"

        headers = {
            'User-Agent': 'YourAppName/1.0 (your.email@example.com)'
        }

        response = requests.get(url, headers=headers)
        response.raise_for_status()

        # Parse the response JSON and return only latitudes and longitudes
        data = response.json()

        geo_locations = [
            {"lat": item['lat'], "lon": item['lon']}  # Extract only latitude and longitude
            for item in data[:5]  # Limit to the first 5 locations
        ]

        return geo_locations

    except Exception as e:
        print(f"Error fetching geo-locations for {street_name}, {city_name}, {county_name}: {e}")
        return []


def fill_table(csv_file_path, db_config):
    """Read street names, cities, and counties from a CSV file and insert into the database."""
    try:
        # Connect to the database
        connection = psycopg2.connect(**db_config)
        cursor = connection.cursor()

        # Read the CSV file with street names, cities, and counties
        with open(csv_file_path, 'r') as csv_file:
            csv_reader = csv.DictReader(csv_file)
            
            # Prepare SQL query to insert data into the database
            insert_query = """
                INSERT INTO street_geo_locations (street_name, city, county, geo_locations) 
                VALUES (%s, %s, %s, %s)
            """

            for row in csv_reader:
                street_name = row['Street']
                city_name = row['City']
                county_name = row['County']

                # Fetch geo-locations for the street, city, and county
                geo_locations = get_geo_locations(street_name, city_name, county_name)

                if geo_locations:
                    cursor.execute(insert_query, (street_name, city_name, county_name, Json(geo_locations)))
                    print(f"Inserted: {street_name}, {city_name}, {county_name} with locations {geo_locations}")
                else:
                    print(f"No geo-locations found for {street_name}, {city_name}, {county_name}")

            # Commit the transaction
            connection.commit()

    except Exception as e:
        print(f"Error: {e}")

    finally:
        # Close the database connection
        if connection:
            cursor.close()
            connection.close()

if __name__ == "__main__":
    # Path to the CSV file with street names, cities, and counties
    csv_file_path = "unique_street_names_3000.csv"

    # Fill the table with data
    fill_table(csv_file_path, db_config)
