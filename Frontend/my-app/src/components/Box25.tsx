import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const AccidentMapByYearAndCity = () => {
  interface AccidentData {
    city: string;
    latitude: number;
    longitude: number;
    street: string;
    no_of_accidents: number;
    year: number;
  }

  // Fixed years from 2016 to 2023
  const years = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023];

  const [cities, setCities] = useState<string[]>([]); // List of cities
  const [selectedYear, setSelectedYear] = useState<number | null>(null); // Selected year
  const [selectedCity, setSelectedCity] = useState<string | null>(null); // Selected city
  const [accidentData, setAccidentData] = useState<AccidentData[] | null>(null); // Accident data
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state
  const [searchQuery, setSearchQuery] = useState<string>(""); // Search query for city

  const mapRef = useRef<any>(null); // Ref for the map instance

  const defaultIcon = new L.Icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const redIcon = new L.Icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  // Fetch available cities on component mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const citiesResponse = await axios.get("http://localhost:8080/location/get_cities");
        setCities(citiesResponse.data.cities); // Update cities
      } catch (error) {
        console.error("Error fetching cities:", error);
        setError("Failed to load cities"); // Error message
      }
    };

    fetchCities();
  }, []);

  // Fetch accident data based on selected year and city
  const fetchAccidentData = async () => {
    if (!selectedYear || !selectedCity) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8081/location_data?year=${selectedYear}&city=${selectedCity}`
      );
      const accidentData = response.data.accident_data;
      if (Array.isArray(accidentData) && accidentData.length > 0) {
        setAccidentData(accidentData); // Update accident data
        setError(null); // Clear error
        updateMapCenter(accidentData); // Update map center
      } else {
        setAccidentData([]); // No data found
        setError("No accident data available for the selected city and year.");
      }
    } catch (error) {
      console.error("Error fetching accident data:", error);
      setError("Failed to load accident data"); // Error message
    } finally {
      setLoading(false);
    }
  };

  // Update map center and zoom level based on accident data
  const updateMapCenter = (accidentData: AccidentData[]) => {
    if (mapRef.current && accidentData.length > 0) {
      const { latitude, longitude } = accidentData[0]; // Get the coordinates of the first accident
      mapRef.current.setView([latitude, longitude], 10); // Update map center and zoom level
    }
  };

  // Handle search query change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Filter cities based on search query
  const filteredCities = cities.filter((city) =>
    city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle city selection and fetch accident data
  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setSearchQuery(''); // Clear search query after selecting a city
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "0px" }}>
      <h1 style={{ textAlign: "center", color: "#333" }}>Accident Map Yeraly</h1>

      {/* Year and City Selection */}
      <div style={{ margin: "20px 0", textAlign: "center", display: "flex", justifyContent: "center", gap: "20px" }}>
        {/* Year Dropdown */}
        <div>
          <label style={{ marginRight: "10px" }}>Year: </label>
          <select
            value={selectedYear ?? ""}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            style={{
              padding: "10px",
              fontSize: "16px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              width: "200px",
            }}
          >
            <option value="" disabled>Select Year</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Search bar for city name */}
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
              transition: "border-color 0.3s ease",
            }}
          />
          {/* Display dropdown list of cities matching the search query */}
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
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
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
                    color: "#333",
                    transition: "background-color 0.3s ease",
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

        {/* Fetch button */}
        <div>
          <button
            onClick={fetchAccidentData}
            disabled={loading || !selectedYear || !selectedCity}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              cursor: "pointer",
              backgroundColor: loading ? "#ccc" : "#4CAF50",
              color: "#fff",
            }}
          >
            {loading ? "Loading..." : "Fetch Data"}
          </button>
        </div>
      </div>

      {/* Display selected city and year */}
      {selectedCity && selectedYear && (
        <div style={{ textAlign: "center", margin: "10px 0", fontSize: "18px" }}>
          {selectedCity} - {selectedYear}
        </div>
      )}

      {error && <div style={{ textAlign: "center", color: "red" }}>{error}</div>}

      {/* Map to display accidents */}
      {accidentData && (
        <MapContainer
          center={[51.505, -0.09]} // Default center
          zoom={10}
          style={{ width: "100%", height: "500px" }}
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {accidentData.map((accident, index) => (
            <Marker
              key={index}
              position={[accident.latitude, accident.longitude]}
              icon={accident.no_of_accidents > 10 ? redIcon : defaultIcon}
            >
              <Popup>
                <div>
                <strong>City:</strong> {accident.city}
                <br />
                  <strong>Street:</strong> {accident.street}
                  <br />
                  <strong>No. of Accidents:</strong> {accident.no_of_accidents}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
};

export default AccidentMapByYearAndCity;