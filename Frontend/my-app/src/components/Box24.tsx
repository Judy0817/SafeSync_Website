import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';

const AccidentMap = () => {
  const [accidentData, setAccidentData] = useState<any[]>([]);
  const mapRef = useRef<any>(null);

  // Fetch accident data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8080/location/location_data_all');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setAccidentData(data.accident_data);
        console.log('Accident data fetched:', data.accident_data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    // Only initialize the map if it's not initialized yet
    if (mapRef.current) return;

    // Initialize the map
    const map = L.map('map').setView([37.7749, -122.4194], 10); // Default to a general location (San Francisco)

    // Set up the tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    // Store the map reference in the ref to prevent reinitialization
    mapRef.current = map;

    // Cleanup map on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Add markers to the map when accident data is loaded
    if (accidentData.length === 0 || !mapRef.current) return;

    // Clear existing markers to avoid adding duplicates
    mapRef.current.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        mapRef.current.removeLayer(layer);
      }
    });

    // Add markers for each accident data point
    accidentData.forEach((accident) => {
      const { latitude, longitude, city, street, no_of_accidents, severity, year } = accident;

      const popupContent = `
        <strong>City:</strong> ${city}<br>
        <strong>Street:</strong> ${street}<br>
        <strong>No. of Accidents:</strong> ${no_of_accidents}<br>
        <strong>Severity:</strong> ${severity}<br>
        <strong>Year:</strong> ${year}
      `;

      // Create a marker for each accident
      L.marker([latitude, longitude])
        .addTo(mapRef.current)
        .bindPopup(popupContent);
    });
  }, [accidentData]); // Run this effect when accidentData changes

  return (
    <div>
      <div id="map" style={{ height: '600px' }}></div>
    </div>
  );
};

export default AccidentMap;