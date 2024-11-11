import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Define accident data structure
interface AccidentData {
  city: string;
  latitude: number;
  longitude: number;
  street: string;
  no_of_accidents: number;
  severity: number;
  country: string;
}

// Default icon for markers
const defaultIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Red icon for severe accidents
const redIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Function to determine marker color based on severity
const getMarkerColor = (severity: number) => {
  if (severity < 2) return defaultIcon;  // Minor accidents
  if (severity < 4) return new L.Icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });  // Moderate accidents
  return redIcon;  // Severe accidents
};

const AccidentSeverityMap: React.FC = () => {
  const [cities, setCities] = useState<string[]>([]); // List of cities
  const [selectedCity, setSelectedCity] = useState<string>(""); // Selected city
  const [accidentData, setAccidentData] = useState<AccidentData[] | null>(null); // Accident data
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state
  const [searchQuery, setSearchQuery] = useState<string>(""); // Search query for city
  const mapRef = useRef<any>(null); // Ref for map instance

  // Fetch city names
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get("http://localhost:8080/get_cities");
        setCities(response.data.cities); // Update cities
      } catch (error) {
        console.error("Error fetching cities:", error);
        setError("Failed to load cities");
      }
    };
    fetchCities();
  }, []);

  // Fetch accident data for selected city
  const fetchAccidentData = async (city: string) => {
    if (!city) return;
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/location_data?city=${city}`);
      const data = response.data.accident_data;
      if (Array.isArray(data) && data.length > 0) {
        setAccidentData(data);
        setError(null);
        updateMapCenter(data); // Update map center
      } else {
        setAccidentData([]);
        setError("No accident data available for the selected city.");
      }
    } catch (error) {
      console.error("Error fetching accident data:", error);
      setError("Failed to load accident data");
    } finally {
      setLoading(false);
    }
  };

  // Update the map center based on first accident's coordinates
  const updateMapCenter = (data: AccidentData[]) => {
    if (mapRef.current && data.length > 0) {
      const { latitude, longitude } = data[0];
      mapRef.current.setView([latitude, longitude], 10); // Adjust zoom as needed
    }
  };

  // Handle search query change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Filter cities based on search query
  const filteredCities = cities.filter(city =>
    city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle city selection and fetch data
  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    fetchAccidentData(city);
    setSearchQuery('');
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "0px" }}>
      <h2 style={{ textAlign: "center", color: "#333" }}>Accident Severity Map</h2>

      {/* Search bar for city */}
      <div style={{ position: "relative", maxWidth: "400px", margin: "0 auto" }}>
        <input
          id="citySearch"
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search for a city"
          style={{
            width: "100%",
            padding: "10px 10px",
            fontSize: "16px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            outline: "none",
          }}
        />
        {searchQuery && filteredCities.length > 0 && (
          <ul
            style={{
              listStyle: "none",
              padding: "0",
              margin: "0",
              maxHeight: "200px",
              overflowY: "auto",
              border: "1px solid #ddd",
              borderTop: "none",
              position: "relative",
              backgroundColor: "white",
              width: "100%",
              borderRadius: "8px",
              zIndex: 1,
            }}
          >
            {filteredCities.map((city, index) => (
              <li
                key={index}
                onClick={() => handleCitySelect(city)}
                style={{
                  padding: "12px",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#f7f7f7")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "white")}
              >
                {city}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Display loading or error messages */}
      {loading && <p style={{ textAlign: "center", fontSize: "18px" }}>Loading accident data...</p>}
      {error && <p style={{ color: "red", textAlign: "center", fontSize: "18px" }}>{error}</p>}

      {/* Map with accident markers */}
      <MapContainer
        ref={mapRef}
        center={[34.2, -82.4]} // Default coordinates, adjust if needed
        zoom={8}
        style={{ height: "500px", width: "100%", marginTop: "20px" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {accidentData && accidentData.length > 0 ? (
          accidentData.map((accident, index) => (
            <Marker
              key={index}
              position={[accident.latitude, accident.longitude]}
              icon={getMarkerColor(accident.severity)}
            >
              <Popup>
                <strong>City:</strong> {accident.city} <br />
                <strong>Street:</strong> {accident.street} <br />
                <strong>Accidents:</strong> {accident.no_of_accidents} <br />
                <strong>Severity:</strong> {accident.severity}
              </Popup>
            </Marker>
          ))
        ) : (
          <p style={{ textAlign: "center" }}>No accident data available for the selected city.</p>
        )}
      </MapContainer>
    </div>
  );
};

export default AccidentSeverityMap;
