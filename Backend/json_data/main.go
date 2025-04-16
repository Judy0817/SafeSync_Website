package main

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"math"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

const (
	host     = "localhost"
	port     = 5432
	user     = "postgres"
	password = "Judy@0817"
	dbname   = "json_db"
	sslmode  = "disable"
)

type RoadFeatureWithGeo struct {
	StreetName  string          `json:"street_name"`
	CityName    string          `json:"city_name"`
	CountyName  string          `json:"county_name"`
	GeoLocation json.RawMessage `json:"geo_location"` // Optional: store geo-location data as JSON
}

type SeverityResponse struct {
	Severity string `json:"severity"`
}

// RoadFeature represents the structure of a row in the database
type RoadFeatureWIthSeverity struct {
	StreetName      string  `json:"street_name"`
	CityName        string  `json:"city_name"`
	CountyName      string  `json:"county_name"`
	Bump            bool    `json:"bump"`
	Crossing        bool    `json:"crossing"`
	GiveWay         bool    `json:"give_way"`
	Junction        bool    `json:"junction"`
	NoExit          bool    `json:"no_exit"`
	Railway         bool    `json:"railway"`
	Roundabout      bool    `json:"roundabout"`
	Station         bool    `json:"station"`
	Stop            bool    `json:"stop"`
	TrafficCalming  bool    `json:"traffic_calming"`
	TrafficSignal   bool    `json:"traffic_signal"`
	AverageSeverity float64 `json:"average_severity"`
}

// Define the RoadFeature struct
type RoadFeature struct {
	Bump            bool `json:"bump"`
	Crossing        bool `json:"crossing"`
	GiveWay         bool `json:"give_way"`
	Junction        bool `json:"junction"`
	NoExit          bool `json:"no_exit"`
	Railway         bool `json:"railway"`
	Roundabout      bool `json:"roundabout"`
	Station         bool `json:"station"`
	Stop            bool `json:"stop"`
	TrafficCalming  bool `json:"traffic_calming"`
	TrafficSignal   bool `json:"traffic_signal"`
	Traffic_looping bool `json:"traffic_looping"`
	Amenity         bool `json:"amenity"`
}

type WeatherData struct {
	Humidity      string  `json:"humidity(%)"`
	Precipitation string  `json:"precipitation(in)"`
	Pressure      string  `json:"pressure(in)"`
	Severity      float64 `json:"severity"`
	Temperature   string  `json:"temperature(F)"`
	Visibility    string  `json:"visibility(mi)"`
	Weather       string  `json:"weather"`
	WindChill     string  `json:"wind_chill(F)"`
	WindDirection string  `json:"wind_direction"`
	WindSpeed     string  `json:"wind_speed(mph)"`
}

type StreetData struct {
	RoadFeatures RoadFeature `json:"road_features"`
	Weather      WeatherData `json:"weather"`
}

type RouteData struct {
	StartLocation string   `json:"start_location"`
	Destination   string   `json:"destination"`
	StartLatLng   LatLng   `json:"start_lat_lng"`
	EndLatLng     LatLng   `json:"end_lat_lng"`
	RoutePoints   []LatLng `json:"route_points"`
	Distance      string   `json:"distance"`
	Duration      string   `json:"duration"`
}

type LatLng struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}

var db *sql.DB

func main() {
	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		host, port, user, password, dbname, sslmode)

	var err error
	db, err = sql.Open("postgres", psqlInfo)
	if err != nil {
		log.Fatalf("Error opening database: %v", err)
	}
	defer db.Close()

	err = db.Ping()
	if err != nil {
		log.Fatalf("Error connecting to the database: %v", err)
	}

	fmt.Println("Successfully connected to the database!")

	router := gin.Default()

	// Use CORS middleware
	router.Use(cors.Default())

	router.GET("/json/road_features_with_severity", GetRoadFeatures)
	router.GET("/json/road_features_with_weather", GetRoadFeaturesAndWeather)
	router.GET("/json/street_names", GetStreetNames)
	router.GET("/json/calculate_severity", CalculateSeverity)
	router.GET("/json/weather_data", func(c *gin.Context) {
		data, err := getWeatherDataFromAPI(c)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, data)
	})
	router.GET("/json/geolocation", GetGeoLocation)
	router.GET("/json/route", func(c *gin.Context) {
		apiKey := "AIzaSyCxpU3bLfBm37Sf8Lz0SnhLxkQCgcszMZk" // Replace with your API key
		origin := c.DefaultQuery("origin", "")
		destination := c.DefaultQuery("destination", "")

		if origin == "" || destination == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "origin and destination parameters are required",
			})
			return
		}

		routeData, err := getRouteData(apiKey, origin, destination)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, routeData)
	})

	router.GET("/json/nearby_road_info", GetNearbyLocations)

	fmt.Println("Server is running on port 8085")
	log.Fatal(http.ListenAndServe(":8085", router))
}

// Location struct to hold street name, city, county
type Location struct {
	StreetName string `json:"street_name"`
	City       string `json:"city"`
	County     string `json:"county"`
}

// Default location data if no results are found
var defaultLocation = Location{
	StreetName: "Frantz Rd",
	City:       "Dublin",
	County:     "Franklin",
}

// HaversineDistance calculates the distance between two lat/lon points
func HaversineDistance(lat1, lon1, lat2, lon2 float64) float64 {
	const EarthRadiusKm = 6371.0

	dlat := (lat2 - lat1) * math.Pi / 180.0
	dlon := (lon2 - lon1) * math.Pi / 180.0

	a := math.Sin(dlat/2)*math.Sin(dlat/2) + math.Cos(lat1*math.Pi/180.0)*math.Cos(lat2*math.Pi/180.0)*math.Sin(dlon/2)*math.Sin(dlon/2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))

	return EarthRadiusKm * c
}

// GetNearbyLocations is the handler for /json/nearby_road_info
func GetNearbyLocations(c *gin.Context) {
	// Get latitude, longitude, and radius from the query parameters
	userLatStr := c.DefaultQuery("latitude", "")
	userLonStr := c.DefaultQuery("longitude", "")
	radiusStr := c.DefaultQuery("radius", "")

	if userLatStr == "" || userLonStr == "" || radiusStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing parameters"})
		return
	}

	// Convert query parameters to float64
	userLat, err := strconv.ParseFloat(userLatStr, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid latitude"})
		return
	}

	userLon, err := strconv.ParseFloat(userLonStr, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid longitude"})
		return
	}

	radius, err := strconv.ParseFloat(radiusStr, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid radius"})
		return
	}

	// Fetch nearby locations from the database
	nearbyLocation, err := fetchNearbyLocations(userLat, userLon, radius)
	if err != nil {
		log.Println("Error fetching data:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching data"})
		return
	}

	// If no nearby location is found, return the default location
	if nearbyLocation.StreetName == "" {
		nearbyLocation = defaultLocation
	}

	// Return the nearby location (or default) as JSON
	c.JSON(http.StatusOK, nearbyLocation)
}

// fetchNearbyLocations fetches locations from the database and checks for nearby geo locations
func fetchNearbyLocations(userLat, userLon, radius float64) (Location, error) {
	// Build the PostgreSQL connection string
	connStr := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		host, port, user, password, dbname, sslmode)

	// Open the database connection
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Println("Error connecting to the database:", err)
		return Location{}, err
	}
	defer db.Close()

	// Sample query, replace with your actual DB query
	query := `SELECT street_name, city, county, geo_locations FROM street_geo_locations`
	rows, err := db.Query(query)
	if err != nil {
		log.Println("Error executing query:", err)
		return Location{}, err
	}
	defer rows.Close()

	// Initialize the result
	var foundLocation Location

	for rows.Next() {
		var street, city, county string
		var geoJSON string

		// Scan row data
		err := rows.Scan(&street, &city, &county, &geoJSON)
		if err != nil {
			log.Println("Error scanning row:", err)
			return Location{}, err
		}

		// Parse geo_locations JSON (with string lat/lon)
		var geoLocations []struct {
			Lat string `json:"lat"`
			Lon string `json:"lon"`
		}
		err = json.Unmarshal([]byte(geoJSON), &geoLocations)
		if err != nil {
			log.Println("Error unmarshalling geo_locations JSON:", err)
			return Location{}, err
		}

		// Loop through each geo location and check if it's within the radius
		for _, geo := range geoLocations {
			lat, err := strconv.ParseFloat(geo.Lat, 64)
			if err != nil {
				log.Println("Error parsing lat:", geo.Lat)
				continue
			}

			lon, err := strconv.ParseFloat(geo.Lon, 64)
			if err != nil {
				log.Println("Error parsing lon:", geo.Lon)
				continue
			}

			distance := HaversineDistance(userLat, userLon, lat, lon)
			if distance <= radius {
				// If nearby, store the location details
				foundLocation = Location{
					StreetName: street,
					City:       city,
					County:     county,
				}
				break // Exit after finding the first nearby location
			}
		}

		// If a location has been found, stop further processing
		if foundLocation.StreetName != "" {
			break
		}
	}

	if err := rows.Err(); err != nil {
		log.Println("Error iterating over rows:", err)
		return Location{}, err
	}

	// Return the found location or empty Location if not found
	return foundLocation, nil
}

func getRouteData(apiKey, origin, destination string) (*RouteData, error) {
	baseURL := "https://maps.googleapis.com/maps/api/directions/json"
	params := url.Values{}
	params.Add("origin", origin)
	params.Add("destination", destination)
	params.Add("key", apiKey)

	reqURL := fmt.Sprintf("%s?%s", baseURL, params.Encode())
	resp, err := http.Get(reqURL)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %v", err)
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %v", err)
	}

	var data struct {
		Routes []struct {
			Legs []struct {
				StartLocation LatLng `json:"start_location"`
				EndLocation   LatLng `json:"end_location"`
				Steps         []struct {
					StartLocation LatLng `json:"start_location"`
					EndLocation   LatLng `json:"end_location"`
				} `json:"steps"`
				Distance struct {
					Text string `json:"text"`
				} `json:"distance"`
				Duration struct {
					Text string `json:"text"`
				} `json:"duration"`
			} `json:"legs"`
		} `json:"routes"`
	}

	err = json.Unmarshal(body, &data)
	if err != nil {
		return nil, fmt.Errorf("failed to parse response: %v", err)
	}

	if len(data.Routes) == 0 || len(data.Routes[0].Legs) == 0 {
		return nil, fmt.Errorf("no routes found")
	}

	leg := data.Routes[0].Legs[0]
	routePoints := []LatLng{}
	for _, step := range leg.Steps {
		routePoints = append(routePoints, step.StartLocation, step.EndLocation)
	}

	routeData := &RouteData{
		StartLocation: origin,
		Destination:   destination,
		StartLatLng:   leg.StartLocation,
		EndLatLng:     leg.EndLocation,
		RoutePoints:   routePoints,
		Distance:      leg.Distance.Text,
		Duration:      leg.Duration.Text,
	}

	return routeData, nil
}

func formatToTwoDecimalPlaces(value float64) string {
	return fmt.Sprintf("%.2f", value)
}

func kelvinToFahrenheit(kelvin float64) float64 {
	return (kelvin-273.15)*9/5 + 32
}

func celsiusToFahrenheit(celsius float64) float64 {
	return (celsius * 9 / 5) + 32
}

func hpaToInHg(hpa float64) float64 {
	return hpa / 33.8639
}

func metersToMiles(meters float64) float64 {
	return meters / 1609.344
}

func mpsToMph(mps float64) float64 {
	return mps * 2.23694
}

func getWindDirection(deg float64) string {
	// Mapping degree ranges to cardinal directions
	if deg >= 0 && deg < 22.5 {
		return "North"
	} else if deg >= 22.5 && deg < 45 {
		return "NNE"
	} else if deg >= 45 && deg < 67.5 {
		return "NE"
	} else if deg >= 67.5 && deg < 90 {
		return "ENE"
	} else if deg >= 90 && deg < 112.5 {
		return "East"
	} else if deg >= 112.5 && deg < 135 {
		return "ESE"
	} else if deg >= 135 && deg < 157.5 {
		return "SE"
	} else if deg >= 157.5 && deg < 180 {
		return "SSE"
	} else if deg >= 180 && deg < 202.5 {
		return "South"
	} else if deg >= 202.5 && deg < 225 {
		return "SSW"
	} else if deg >= 225 && deg < 247.5 {
		return "SW"
	} else if deg >= 247.5 && deg < 270 {
		return "WSW"
	} else if deg >= 270 && deg < 292.5 {
		return "West"
	} else if deg >= 292.5 && deg < 315 {
		return "WNW"
	} else if deg >= 315 && deg < 337.5 {
		return "NW"
	} else if deg >= 337.5 && deg < 360 {
		return "North"
	} else {
		// Handle cases where wind direction is calm or variable
		return "Calm"
	}
}

// GetStreetNames handles requests to fetch only street names from the database
func GetStreetNames(c *gin.Context) {
	// Query the database for street names, cities, and counties
	query := "SELECT street_name, city, county FROM street_geo_locations"
	rows, err := db.Query(query)
	if err != nil {
		log.Println("Error fetching data:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch data"})
		return
	}
	defer rows.Close()

	var results []string
	for rows.Next() {
		var streetName, city, county string
		err := rows.Scan(&streetName, &city, &county)
		if err != nil {
			log.Println("Error scanning data:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process data"})
			return
		}

		// Combine streetName, city, and county into the desired format
		formatted := streetName + "," + city + "," + county
		results = append(results, formatted)
	}

	// Handle any errors encountered during iteration
	err = rows.Err()
	if err != nil {
		log.Println("Error during rows iteration:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error processing data"})
		return
	}

	// If no records are found
	if len(results) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No records found"})
		return
	}

	// Respond with JSON for the list of formatted strings
	c.JSON(http.StatusOK, results)
}

func GetRoadFeatures(c *gin.Context) {
	// Get the street name, city name, and county name from query parameters
	streetName := c.DefaultQuery("street_name", "") // Default to empty if no street_name is provided
	cityName := c.DefaultQuery("city_name", "")     // Default to empty if no city_name is provided
	countyName := c.DefaultQuery("county_name", "") // Default to empty if no county_name is provided

	// Check if all necessary parameters are provided
	if streetName == "" || cityName == "" || countyName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Street name, city name, and county name are required"})
		return
	}

	// Normalize the inputs to lowercase for case-insensitive comparison
	streetName = strings.ToLower(streetName)
	cityName = strings.ToLower(cityName)
	countyName = strings.ToLower(countyName)

	// Query the database for the specific street name, city name, and county name
	query := `SELECT * FROM road_features_with_severity 
			  WHERE LOWER(street_name) = $1 AND LOWER(city_name) = $2 AND LOWER(county_name) = $3`
	rows, err := db.Query(query, streetName, cityName, countyName)
	if err != nil {
		log.Fatal("Error fetching data:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch data"})
		return
	}
	defer rows.Close()

	var features []RoadFeatureWIthSeverity
	for rows.Next() {
		var feature RoadFeatureWIthSeverity
		err := rows.Scan(
			&feature.StreetName,
			&feature.CityName,
			&feature.CountyName,
			&feature.Bump,
			&feature.Crossing,
			&feature.GiveWay,
			&feature.Junction,
			&feature.NoExit,
			&feature.Railway,
			&feature.Roundabout,
			&feature.Station,
			&feature.Stop,
			&feature.TrafficCalming,
			&feature.TrafficSignal,
			&feature.AverageSeverity,
		)
		if err != nil {
			log.Fatal("Error scanning data:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process data"})
			return
		}
		features = append(features, feature)
	}

	// Handle any errors encountered during iteration
	err = rows.Err()
	if err != nil {
		log.Fatal("Error during rows iteration:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error processing data"})
		return
	}

	// If no data is found for the provided street, city, and county
	if len(features) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No road features found for the specified street, city, and county"})
		return
	}

	// Respond with JSON for the specific street, city, and county
	c.JSON(http.StatusOK, features)
}

func GetRoadFeaturesAndWeather(c *gin.Context) {
	// Get the street name, city name, and county name from query parameters
	streetName := c.DefaultQuery("street_name", "") // Default to empty if no street_name is provided
	cityName := c.DefaultQuery("city_name", "")     // Default to empty if no city_name is provided
	countyName := c.DefaultQuery("county_name", "") // Default to empty if no county_name is provided

	// Check if street name is provided
	if streetName == "" || cityName == "" || countyName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Street name, county name and city names are required"})
		return
	}

	// Query the database for the specific street name, city name, and county name
	query := `
        SELECT street_name, city_name, county_name, bump, crossing, give_way, junction, 
       no_exit, railway, roundabout, station, stop, traffic_calming, traffic_signal
FROM road_features_with_severity
WHERE street_name = $1 AND city_name = $2 AND county_name = $3;

    `
	rows, err := db.Query(query, streetName, cityName, countyName)
	if err != nil {
		log.Fatal("Error fetching data:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch data"})
		return
	}
	defer rows.Close()

	var features []RoadFeatureWIthSeverity
	for rows.Next() {
		var feature RoadFeatureWIthSeverity
		err := rows.Scan(
			&feature.StreetName,
			&feature.CityName,   // Add CityName to struct
			&feature.CountyName, // Add CountyName to struct
			&feature.Bump,
			&feature.Crossing,
			&feature.GiveWay,
			&feature.Junction,
			&feature.NoExit,
			&feature.Railway,
			&feature.Roundabout,
			&feature.Station,
			&feature.Stop,
			&feature.TrafficCalming,
			&feature.TrafficSignal,
		)
		if err != nil {
			log.Fatal("Error scanning data:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process data"})
			return
		}
		features = append(features, feature)
	}

	// Handle any errors encountered during iteration
	err = rows.Err()
	if err != nil {
		log.Fatal("Error during rows iteration:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error processing data"})
		return
	}

	// If no data is found for the provided street name, city name, and county name
	if len(features) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No road features found for the specified street, city, or county"})
		return
	}

	// Get the weather data (either call GetWeatherData or replicate its logic here)
	weatherDataFormatted, err := getWeatherDataFromAPI(c) // Pass the context to the API function
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch weather data"})
		return
	}

	// Format the road features in the required structure
	roadFeaturesFormatted := gin.H{
		"bump":            features[0].Bump,
		"crossing":        features[0].Crossing,
		"give_way":        features[0].GiveWay,
		"junction":        features[0].Junction,
		"no_exit":         features[0].NoExit,
		"railway":         features[0].Railway,
		"roundabout":      features[0].Roundabout,
		"station":         features[0].Station,
		"stop":            features[0].Stop,
		"traffic_calming": features[0].TrafficCalming,
		"traffic_signal":  features[0].TrafficSignal,
	}

	// Define the data structure for the final output
	finalModelInput := gin.H{
		"weather": gin.H{
			"weather":           weatherDataFormatted["weather"],
			"temperature(F)":    weatherDataFormatted["temperature(F)"],
			"humidity(%)":       weatherDataFormatted["humidity(%)"],
			"wind_chill(F)":     weatherDataFormatted["wind_chill(F)"],
			"pressure(in)":      weatherDataFormatted["pressure(in)"],
			"visibility(mi)":    weatherDataFormatted["visibility(mi)"],
			"wind_direction":    weatherDataFormatted["wind_direction"],
			"wind_speed(mph)":   weatherDataFormatted["wind_speed(mph)"],
			"precipitation(in)": weatherDataFormatted["precipitation(in)"],
		},
		"road_features": roadFeaturesFormatted,
	}

	// Respond with the formatted data
	c.JSON(http.StatusOK, finalModelInput)
}

// This function fetches weather data from the OpenWeatherMap API
func getWeatherDataFromAPI(c *gin.Context) (gin.H, error) {
	latitude := c.DefaultQuery("latitude", "")
	longitude := c.DefaultQuery("longitude", "")
	if latitude == "" || longitude == "" {
		return nil, fmt.Errorf("latitude and longitude parameters are required")
	}
	apiKey := "2601fcbe1411562dc72d4050e299d2c7"
	apiURL := fmt.Sprintf("https://api.openweathermap.org/data/2.5/weather?lat=%s&lon=%s&appid=%s", latitude, longitude, apiKey)
	resp, err := http.Get(apiURL)
	if err != nil {
		return nil, fmt.Errorf("Failed to get weather data: %v", err)
	}
	defer resp.Body.Close()

	var weatherData map[string]interface{}
	body, _ := ioutil.ReadAll(resp.Body)

	if err := json.Unmarshal(body, &weatherData); err != nil {
		return nil, fmt.Errorf("Failed to parse weather data: %v", err)
	}

	// Parse relevant data (same as in your GetWeatherData function)
	weather := weatherData["weather"].([]interface{})[0].(map[string]interface{})["description"]
	main := weatherData["main"].(map[string]interface{})
	temperature := main["temp"].(float64)
	humidity := main["humidity"].(float64)
	pressure := main["pressure"].(float64)

	var visibility float64
	if vis, ok := weatherData["visibility"].(float64); ok {
		visibility = vis
	} else {
		visibility = 0.0
	}

	wind := weatherData["wind"].(map[string]interface{})
	windSpeed := wind["speed"].(float64)
	windDirection := wind["deg"].(float64)

	rain := weatherData["rain"]
	precipitation := 0.0
	if rain != nil {
		if rainData, ok := rain.(map[string]interface{}); ok {
			if p, ok := rainData["1h"].(float64); ok {
				precipitation = p
			}
		}
	}

	// Convert values to appropriate units
	temperatureFahrenheit := kelvinToFahrenheit(temperature)
	windChillCelsius := 13.12 + 0.6215*(temperature-273.15) - 11.37*(windSpeed*3.6)*0.16 + 0.3965*(temperature-273.15)*(windSpeed*3.6)*0.16
	windChillFahrenheit := celsiusToFahrenheit(windChillCelsius)
	pressureInHg := hpaToInHg(pressure)
	visibilityMiles := metersToMiles(visibility)
	windSpeedMph := mpsToMph(windSpeed)

	weatherDataFormatted := gin.H{
		"weather":           weather,
		"temperature(F)":    formatToTwoDecimalPlaces(temperatureFahrenheit),
		"humidity(%)":       formatToTwoDecimalPlaces(humidity),
		"wind_chill(F)":     formatToTwoDecimalPlaces(windChillFahrenheit),
		"pressure(in)":      formatToTwoDecimalPlaces(pressureInHg),
		"visibility(mi)":    formatToTwoDecimalPlaces(visibilityMiles),
		"wind_direction":    getWindDirection(windDirection),
		"wind_speed(mph)":   formatToTwoDecimalPlaces(windSpeedMph),
		"precipitation(in)": formatToTwoDecimalPlaces(precipitation),
	}

	return weatherDataFormatted, nil
}

func calculateSeverity(weather WeatherData, road RoadFeature) float64 {
	url := "http://127.0.0.1:5000/predict"

	temp, _ := strconv.ParseFloat(weather.Temperature, 64)
	windSpeed, _ := strconv.ParseFloat(weather.WindSpeed, 64)
	//pressure, _ := strconv.ParseFloat(weather.Pressure, 64)
	visibility, _ := strconv.ParseFloat(weather.Visibility, 64)
	//windChill, _ := strconv.ParseFloat(weather.WindChill, 64)
	humidity, _ := strconv.ParseFloat(weather.Humidity, 64)
	precipitation, _ := strconv.ParseFloat(weather.Precipitation, 64)

	requestBody := map[string]interface{}{
		"Temperature(F)":    temp,
		"Wind_Direction":    weather.WindDirection,
		"Wind_Speed(mph)":   windSpeed,
		"Pressure(in)":      29.92,
		"Visibility(mi)":    visibility,
		"Wind_Chill(F)":     70,
		"Humidity(%)":       humidity,
		"Precipitation(in)": precipitation,
		"Weather_Condition": weather.Weather,
		"Bump":              road.Bump,
		"Crossing":          road.Crossing,
		"Give_Way":          road.GiveWay,
		"Junction":          road.Junction,
		"No_Exit":           road.NoExit,
		"Railway":           road.Railway,
		"Roundabout":        road.Roundabout,
		"Station":           road.Station,
		"Stop":              road.Stop,
		"Traffic_Calming":   road.TrafficCalming,
		"Traffic_Signal":    road.TrafficSignal,
		"Turning_Loop":      road.Traffic_looping,
		"Amenity":           road.Amenity,
	}

	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		fmt.Println("Error marshalling JSON:", err)
		return 0
	}

	resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Println("Error sending request:", err)
		return 0
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error reading response body:", err)
		return 0
	}

	// Use map[string]interface{} to handle different data types
	var responseMap map[string]interface{}
	err = json.Unmarshal(body, &responseMap)
	if err != nil {
		fmt.Println("Error unmarshalling response:", err)
		return 0
	}

	severityValue, exists := responseMap["severity"]
	if !exists {
		fmt.Println("Severity key not found in response")
		return 0
	}

	// Convert severity to float64
	severity, ok := severityValue.(float64)
	if !ok {
		fmt.Println("Error converting severity to float")
		return 0
	}

	return severity

}

func CalculateSeverity(c *gin.Context) {
	// Extract values from query parameters
	temperature := c.DefaultQuery("temperature", "0")
	pressure := c.DefaultQuery("pressure", "0")
	windDirection := c.DefaultQuery("wind_direction", "")
	windSpeed := c.DefaultQuery("wind_speed", "0")
	weather_condition := c.DefaultQuery("weather_condition", "Clear")

	bump := c.DefaultQuery("bump", "false") == "true"
	crossing := c.DefaultQuery("crossing", "false") == "true"
	giveWay := c.DefaultQuery("give_way", "false") == "true"
	junction := c.DefaultQuery("junction", "false") == "true"
	noExit := c.DefaultQuery("no_exit", "false") == "true"
	railway := c.DefaultQuery("railway", "false") == "true"
	roundabout := c.DefaultQuery("roundabout", "false") == "true"
	station := c.DefaultQuery("station", "false") == "true"
	stop := c.DefaultQuery("stop", "false") == "true"
	trafficCalming := c.DefaultQuery("traffic_calming", "false") == "true"
	trafficSignal := c.DefaultQuery("traffic_signal", "false") == "true"

	wind_chill := c.DefaultQuery("wind_chill", "70")
	humidity := c.DefaultQuery("humidity", "50")
	visibility := c.DefaultQuery("visibility", "10")
	precipitation := c.DefaultQuery("precipitation", "0")
	trafficLooping := c.DefaultQuery("traffic_looping", "false") == "true"
	amenity := c.DefaultQuery("Amenity", "false") == "true"

	// Convert the extracted query parameters into the WeatherData and RoadFeature structs
	weather_data := WeatherData{
		Temperature:   temperature,
		Pressure:      pressure,
		WindDirection: windDirection,
		WindSpeed:     windSpeed,
		WindChill:     wind_chill,
		Humidity:      humidity,
		Visibility:    visibility,
		Precipitation: precipitation,
		Weather:       weather_condition,
	}

	road := RoadFeature{
		Bump:            bump,
		Crossing:        crossing,
		GiveWay:         giveWay,
		Junction:        junction,
		NoExit:          noExit,
		Railway:         railway,
		Roundabout:      roundabout,
		Station:         station,
		Stop:            stop,
		TrafficCalming:  trafficCalming,
		TrafficSignal:   trafficSignal,
		Traffic_looping: trafficLooping,
		Amenity:         amenity,
	}

	// Calculate the severity
	severity := calculateSeverity(weather_data, road)

	// Respond with the calculated severity
	c.JSON(http.StatusOK, gin.H{
		"severity": severity,
	})
}

// Helper function to parse float values from query parameters
func parseFloat(value string) float64 {
	// Convert the string to a float, default to 0 if invalid
	result, err := strconv.ParseFloat(value, 64)
	if err != nil {
		return 0
	}
	return result
}

func GetGeoLocation(c *gin.Context) {
	streetName := c.DefaultQuery("street_name", "")
	cityName := c.DefaultQuery("city_name", "")
	countyName := c.DefaultQuery("county_name", "")

	if streetName == "" || cityName == "" || countyName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "street_name, city_name, and county_name parameters are required"})
		return
	}

	// Build the query string for the geolocation API
	query := fmt.Sprintf("%s, %s, %s", streetName, cityName, countyName)
	encodedQuery := url.QueryEscape(query)

	// Using Nominatim API for geolocation (OpenStreetMap)
	apiURL := fmt.Sprintf("https://nominatim.openstreetmap.org/search?q=%s&format=json", encodedQuery)
	resp, err := http.Get(apiURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get geolocation"})
		return
	}
	defer resp.Body.Close()

	body, _ := ioutil.ReadAll(resp.Body)

	var geoResults []map[string]interface{}
	if err := json.Unmarshal(body, &geoResults); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse geolocation response"})
		return
	}

	// If no results, return error
	if len(geoResults) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Location not found"})
		return
	}

	// Get the first result, assuming it's the most relevant one
	lat := geoResults[0]["lat"]
	lon := geoResults[0]["lon"]

	// Convert lat and lon to string
	latitude, _ := lat.(string)
	longitude, _ := lon.(string)

	c.JSON(http.StatusOK, gin.H{
		"latitude":  latitude,
		"longitude": longitude,
	})
}
