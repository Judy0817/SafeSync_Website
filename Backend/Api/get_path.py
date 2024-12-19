from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# Replace with your Google Maps API key
GOOGLE_API_KEY = "YOUR_GOOGLE_API_KEY"

@app.route('/get-places', methods=['GET'])
def get_places():
    # Get starting and destination points from query parameters
    start = request.args.get('start')  # e.g., "40.748817,-73.985428"
    end = request.args.get('end')      # e.g., "40.730610,-73.935242"
    if not start or not end:
        return jsonify({"error": "Missing start or end parameter"}), 400

    # Get the route from Google Directions API
    directions_url = "https://maps.googleapis.com/maps/api/directions/json"
    directions_params = {
        "origin": start,
        "destination": end,
        "key": GOOGLE_API_KEY
    }
    directions_response = requests.get(directions_url, params=directions_params)
    directions_data = directions_response.json()

    if directions_data["status"] != "OK":
        return jsonify({"error": "Unable to fetch route"}), 500

    # Decode the polyline into a list of coordinates
    polyline = directions_data["routes"][0]["overview_polyline"]["points"]
    path = decode_polyline(polyline)

    # Calculate 10 evenly spaced points along the path
    ten_points = evenly_spaced_points(path, num_points=10)

    # Fetch places near each of the 10 points using Google Places API
    places = []
    for point in ten_points:
        lat, lng = point
        places.extend(fetch_nearby_places(lat, lng))

    return jsonify({"places": places})

def decode_polyline(polyline_str):
    """Decodes a polyline string into a list of (latitude, longitude) tuples."""
    index, lat, lng = 0, 0, 0
    coordinates = []
    while index < len(polyline_str):
        for result in [0, 0]:
            shift, result = 0, 0
            while True:
                byte = ord(polyline_str[index]) - 63
                index += 1
                result |= (byte & 0x1f) << shift
                shift += 5
                if not byte & 0x20:
                    break
            result = ~(result >> 1) if result & 1 else result >> 1
            lat += result if coordinates else result
        coordinates.append((lat / 1e5, lng / 1e5))
    return coordinates

def evenly_spaced_points(path, num_points):
    """Returns `num_points` evenly spaced points along a path."""
    total_length = sum(haversine(path[i], path[i+1]) for i in range(len(path) - 1))
    segment_length = total_length / (num_points - 1)
    points = [path[0]]
    current_length, next_point_index = 0, 1

    for i in range(1, len(path)):
        while current_length + haversine(path[i-1], path[i]) >= segment_length * next_point_index:
            ratio = (segment_length * next_point_index - current_length) / haversine(path[i-1], path[i])
            interpolated_lat = path[i-1][0] + ratio * (path[i][0] - path[i-1][0])
            interpolated_lng = path[i-1][1] + ratio * (path[i][1] - path[i-1][1])
            points.append((interpolated_lat, interpolated_lng))
            next_point_index += 1
        current_length += haversine(path[i-1], path[i])
    return points[:num_points]

def haversine(point1, point2):
    """Calculates the haversine distance between two points (lat, lng)."""
    from math import radians, sin, cos, sqrt, atan2
    lat1, lng1, lat2, lng2 = map(radians, (*point1, *point2))
    dlat, dlng = lat2 - lat1, lng2 - lng1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlng/2)**2
    return 6371 * 2 * atan2(sqrt(a), sqrt(1 - a))  # Radius of Earth in kilometers

def fetch_nearby_places(lat, lng, radius=500):
    """Fetches nearby places for a given latitude and longitude."""
    places_url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    places_params = {
        "location": f"{lat},{lng}",
        "radius": radius,
        "key": GOOGLE_API_KEY
    }
    response = requests.get(places_url, params=places_params)
    data = response.json()
    if data["status"] == "OK":
        return [{"name": place["name"], "location": place["geometry"]["location"]} for place in data["results"]]
    return []

if __name__ == "__main__":
    app.run(debug=True)
