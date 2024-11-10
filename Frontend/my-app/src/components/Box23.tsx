import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

const MapView = () => {
  interface AccidentData {
    city: string;
    latitude: number;
    longitude: number;
    street: string;
    no_of_accidents: number;
  }

  const [accidentData, setAccidentData] = useState<AccidentData[]>([]);
  const [filteredData, setFilteredData] = useState<AccidentData[]>([]);
  const [selectedCity, setSelectedCity] = useState("All");
  const [cities, setCities] = useState<string[]>(["All"]);
  const [searchTerm, setSearchTerm] = useState("");

  // Custom icons for markers
  const defaultIcon = new L.Icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const highlightedIcon = new L.Icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  // Fetch accident data from the API on component mount
  useEffect(() => {
    axios
      .get("http://localhost:8080/location_data") // Replace with your API URL
      .then((response) => {
        const data = response.data.accident_data;
        setAccidentData(data);
        setFilteredData(data);

        // Update cities list with unique city names
        const uniqueCities: string[] = Array.from(new Set(data.map((item: { city: any; }) => item.city)));
        setCities(["All", ...uniqueCities].sort());
      })
      .catch((error) => {
        console.error("Error fetching accident data:", error);
      });
  }, []);

  // Handle city selection
  const handleCityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const city = event.target.value;
    setSelectedCity(city);
    setFilteredData(city === "All" ? accidentData : accidentData.filter((data) => data.city === city));
  };

  // Handle search input for city names
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Handle Enter key press for search
  const handleSearchKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const searchResults = accidentData.filter((data) =>
        data.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(searchResults);
    }
  };

  return (
    <div>
      <h2>Accident Data Map</h2>

      {/* Search bar for filtering by city name */}
      <label htmlFor="citySearch">Search City:</label>
      <input
        id="citySearch"
        type="text"
        placeholder="Search city..."
        value={searchTerm}
        onChange={handleSearchChange}
        onKeyDown={handleSearchKeyPress} // Handle Enter key
      />

      {/* City selection dropdown */}
      <label htmlFor="citySelect">Or Select City:</label>
      <select id="citySelect" value={selectedCity} onChange={handleCityChange}>
        {cities.map((city, index) => (
          <option key={index} value={city}>
            {city}
          </option>
        ))}
      </select>

      {/* Map rendering accident data */}
      <MapContainer center={[34.2, -82.4]} zoom={8} style={{ height: "500px", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {filteredData.map((accident, index) => (
          <Marker
            key={index}
            position={[accident.latitude, accident.longitude]}
            icon={
              searchTerm && accident.city.toLowerCase().includes(searchTerm.toLowerCase())
                ? highlightedIcon
                : defaultIcon
            }
          >
            <Popup>
              <strong>Street:</strong> {accident.street} <br />
              <strong>Accidents:</strong> {accident.no_of_accidents}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
