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
    severity: number;
  }

  const years = ["All", 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023];
  const [cities, setCities] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("2019");
  const [selectedCity, setSelectedCity] = useState<string>("Lenexa");
  const [accidentData, setAccidentData] = useState<AccidentData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const mapRef = useRef<any>(null);

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

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const citiesResponse = await axios.get("http://localhost:8080/get_cities");
        setCities(citiesResponse.data.cities);
      } catch (error) {
        console.error("Error fetching cities:", error);
        setError("Failed to load cities");
      }
    };

    fetchCities();
  }, []);

  const fetchAccidentData = async () => {
    if (!selectedCity) return;
  
    setLoading(true);
    try {
      // Only include 'year' if it's not 'All'
      const yearParam = selectedYear === "All" ? "" : `year=${selectedYear}`;
  
      const url = `http://localhost:8080/location_data?city=${selectedCity}${yearParam ? `&${yearParam}` : ""}`;
  
      const response = await axios.get(url);
      const accidentData = response.data.accident_data;
  
      if (Array.isArray(accidentData) && accidentData.length > 0) {
        setAccidentData(accidentData);
        setError(null);
        updateMapCenter(accidentData);
      } else {
        setAccidentData([]);
        setError("No accident data available for the selected city and year.");
      }
    } catch (error) {
      console.error("Error fetching accident data:", error);
      setError("Failed to load accident data");
    } finally {
      setLoading(false);
    }
  };
  
  

  const updateMapCenter = (accidentData: AccidentData[]) => {
    if (mapRef.current && accidentData.length > 0) {
      const { latitude, longitude } = accidentData[0];
      mapRef.current.setView([latitude, longitude], 10);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredCities = cities.filter((city) =>
    city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setSearchQuery('');
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "0px" }}>
      <h1 style={{ textAlign: "center", color: "#333" }}>Accident Map Yearly</h1>

      <div style={{ margin: "20px 0", textAlign: "center", display: "flex", justifyContent: "center", gap: "20px" }}>
        <div>
          <label style={{ marginRight: "10px" }}>Year: </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            style={{
              padding: "10px",
              fontSize: "16px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              width: "200px",
            }}
          >
            <option value="All">All</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

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

        <div>
          <button
            onClick={fetchAccidentData}
            disabled={loading || !selectedCity}
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

      {selectedCity && (
        <div style={{ textAlign: "center", margin: "10px 0", fontSize: "18px" }}>
          {selectedCity} - {selectedYear}
        </div>
      )}

      {error && <div style={{ textAlign: "center", color: "red" }}>{error}</div>}

      <MapContainer
        center={[39.0997, -94.5786]} // Default coordinates (Kansas City)
        zoom={5}
        style={{ width: "100%", height: "500px" }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {accidentData && accidentData.map((accident, index) => (
          <Marker
            key={index}
            position={[accident.latitude, accident.longitude]}
            icon={accident.severity >= 3 ? redIcon : defaultIcon}
          >
            <Popup>
              <div>
                <strong>City:</strong> {accident.city}
                <br />
                <strong>Street:</strong> {accident.street}
                <br />
                <strong>Year:</strong> {accident.year}
                <br />
                <strong>Severity:</strong> {accident.severity}
                <br />
                <strong>Accidents:</strong> {accident.no_of_accidents}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default AccidentMapByYearAndCity;
