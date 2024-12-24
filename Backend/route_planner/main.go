package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
)

// Structs for Google API and Weather data
type GooglePlace struct {
	PlaceID   string `json:"place_id"`
	PlaceName string `json:"name"`
}

type WeatherData struct {
	TemperatureF     float64 `json:"temperature_F"`
	WindChillF       float64 `json:"wind_chill_F"`
	HumidityPercent  float64 `json:"humidity_percent"`
	PressureIn       float64 `json:"pressure_in"`
	VisibilityMi     float64 `json:"visibility_mi"`
	WindDirection    string  `json:"wind_direction"`
	WindSpeedMph     float64 `json:"wind_speed_mph"`
	PrecipitationIn  float64 `json:"precipitation_in"`
	WeatherCondition string  `json:"weather_condition"`
}

type RoadFeatures struct {
	TemperatureF     float64 `json:"temperature_F"`
	WindChillF       float64 `json:"wind_chill_F"`
	HumidityPercent  float64 `json:"humidity_percent"`
	PressureIn       float64 `json:"pressure_in"`
	VisibilityMi     float64 `json:"visibility_mi"`
	WindDirection    string  `json:"wind_direction"`
	WindSpeedMph     float64 `json:"wind_speed_mph"`
	PrecipitationIn  float64 `json:"precipitation_in"`
	WeatherCondition string  `json:"weather_condition"`
	Severity         string  `json:"severity"`
}

type Place struct {
	PlaceID      string       `json:"place_id"`
	PlaceName    string       `json:"place_name"`
	WeatherData  WeatherData  `json:"weather_data"`
	RoadFeatures RoadFeatures `json:"road_features"`
}

type RouteData struct {
	StartingPoint string  `json:"starting_point"`
	Destination   string  `json:"destination"`
	Places        []Place `json:"places"`
}

// Google Maps API URL and API Key
const googleAPIKey = "YOUR_GOOGLE_API_KEY"
const googlePlacesAPIURL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"

// Helper function to fetch places from Google Maps API
func getGooglePlaces(start string, end string) ([]GooglePlace, error) {
	// Construct the request URL
	url := fmt.Sprintf("%s?location=%s&radius=5000&type=point_of_interest&key=%s", googlePlacesAPIURL, start, googleAPIKey)

	// Send request to Google Places API
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// Read the response body
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var result map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, err
	}

	// Parse the results into a list of GooglePlace objects
	places := []GooglePlace{}
	for _, p := range result["results"].([]interface{}) {
		place := p.(map[string]interface{})
		places = append(places, GooglePlace{
			PlaceID:   place["place_id"].(string),
			PlaceName: place["name"].(string),
		})
	}

	return places, nil
}

// Helper function to fetch weather data for a place
func getWeatherData(placeID string) (WeatherData, error) {
	// Construct the URL to fetch weather data for this place (use your existing /weather/weather_data endpoint)
	url := fmt.Sprintf("http://localhost:8080/weather/weather_data?place_id=%s", placeID)

	// Send request to your weather API
	resp, err := http.Get(url)
	if err != nil {
		return WeatherData{}, err
	}
	defer resp.Body.Close()

	// Read the response body
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return WeatherData{}, err
	}

	var weatherData WeatherData
	if err := json.Unmarshal(body, &weatherData); err != nil {
		return WeatherData{}, err
	}

	return weatherData, nil
}

// Helper function to fetch road features (same endpoint as weather data)
func getRoadFeatures(placeID string) (RoadFeatures, error) {
	// Construct the URL to fetch road features for this place (use your existing /weather/weather_data endpoint)
	url := fmt.Sprintf("http://localhost:8080/weather/weather_data?place_id=%s", placeID)

	// Send request to your road features API
	resp, err := http.Get(url)
	if err != nil {
		return RoadFeatures{}, err
	}
	defer resp.Body.Close()

	// Read the response body
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return RoadFeatures{}, err
	}

	var roadFeatures RoadFeatures
	if err := json.Unmarshal(body, &roadFeatures); err != nil {
		return RoadFeatures{}, err
	}

	return roadFeatures, nil
}

// Handler to get the route data
func GetRouteData(w http.ResponseWriter, r *http.Request) {
	// Get the geolocation (start and end) from the request query params
	start := r.URL.Query().Get("start")
	end := r.URL.Query().Get("end")

	// Fetch the places from Google Places API
	places, err := getGooglePlaces(start, end)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error fetching places: %s", err), http.StatusInternalServerError)
		return
	}

	// Limit to 5 places
	if len(places) > 5 {
		places = places[:5]
	}

	// Fetch weather data and road features for each place
	var placesData []Place
	for _, p := range places {
		weatherData, err := getWeatherData(p.PlaceID)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error fetching weather data for place %s: %s", p.PlaceID, err), http.StatusInternalServerError)
			return
		}

		roadFeatures, err := getRoadFeatures(p.PlaceID)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error fetching road features for place %s: %s", p.PlaceID, err), http.StatusInternalServerError)
			return
		}

		placesData = append(placesData, Place{
			PlaceID:      p.PlaceID,
			PlaceName:    p.PlaceName,
			WeatherData:  weatherData,
			RoadFeatures: roadFeatures,
		})
	}

	// Create the route data structure
	routeData := RouteData{
		StartingPoint: start,
		Destination:   end,
		Places:        placesData,
	}

	// Set response header
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	// Encode and send the response
	if err := json.NewEncoder(w).Encode(routeData); err != nil {
		http.Error(w, fmt.Sprintf("Error encoding response: %s", err), http.StatusInternalServerError)
	}
}

func main() {
	// Create routes
	http.HandleFunc("/weather/route", GetRouteData)

	// Start the server
	log.Println("Server started at http://localhost:8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal("Error starting server:", err)
	}
}
