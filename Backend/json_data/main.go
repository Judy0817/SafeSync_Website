package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"strconv"

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

// RoadFeature represents the structure of a row in the database
type RoadFeatureWIthSeverity struct {
	StreetName      string  `json:"street_name"`
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
	Bump           bool `json:"bump"`
	Crossing       bool `json:"crossing"`
	GiveWay        bool `json:"give_way"`
	Junction       bool `json:"junction"`
	NoExit         bool `json:"no_exit"`
	Railway        bool `json:"railway"`
	Roundabout     bool `json:"roundabout"`
	Station        bool `json:"station"`
	Stop           bool `json:"stop"`
	TrafficCalming bool `json:"traffic_calming"`
	TrafficSignal  bool `json:"traffic_signal"`
}

// Define the WeatherData struct
type WeatherData struct {
	Temperature      float64 `json:"temperature"`
	Pressure         float64 `json:"pressure"`
	WindDirection    string  `json:"wind_direction"`
	WindSpeed        float64 `json:"wind_speed"`
	WeatherCondition string  `json:"weather_condition"`
}

type StreetData struct {
	RoadFeatures RoadFeature `json:"road_features"`
	Weather      WeatherData `json:"weather"`
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
	router.GET("/weather/geolocation", GetGeoLocation)
	router.GET("json/getStartingDestinationData", getStartingDestinationDataHandler)

	fmt.Println("Server is running on port 8085")
	log.Fatal(http.ListenAndServe(":8085", router))
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
	// Query the database for street names
	query := "SELECT street_name FROM road_features_with_severity"
	rows, err := db.Query(query)
	if err != nil {
		log.Fatal("Error fetching data:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch data"})
		return
	}
	defer rows.Close()

	var streetNames []string
	for rows.Next() {
		var streetName string
		err := rows.Scan(&streetName)
		if err != nil {
			log.Fatal("Error scanning data:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process data"})
			return
		}
		streetNames = append(streetNames, streetName)
	}

	// Handle any errors encountered during iteration
	err = rows.Err()
	if err != nil {
		log.Fatal("Error during rows iteration:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error processing data"})
		return
	}

	// If no street names are found
	if len(streetNames) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No street names found"})
		return
	}

	// Respond with JSON for the list of street names
	c.JSON(http.StatusOK, streetNames)
}

func GetRoadFeatures(c *gin.Context) {
	// Get the street name from query parameters
	streetName := c.DefaultQuery("street_name", "") // Default to empty if no street_name is provided

	if streetName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Street name is required"})
		return
	}

	// Query the database for the specific street name
	query := "SELECT * FROM road_features_with_severity WHERE street_name = $1"
	rows, err := db.Query(query, streetName)
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

	// If no data is found for the provided street name
	if len(features) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No road features found for the specified street"})
		return
	}

	// Respond with JSON for the specific street
	c.JSON(http.StatusOK, features)
}

func GetRoadFeaturesAndWeather(c *gin.Context) {
	// Get the street name from query parameters
	streetName := c.DefaultQuery("street_name", "") // Default to empty if no street_name is provided

	if streetName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Street name is required"})
		return
	}

	// Query the database for the specific street name
	query := "SELECT * FROM road_features_with_severity WHERE street_name = $1"
	rows, err := db.Query(query, streetName)
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

	// If no data is found for the provided street name
	if len(features) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No road features found for the specified street"})
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
		"speed_bumps": features[0].Bump,
		"crossings":   features[0].Crossing,
		"give_way":    features[0].GiveWay,
		"junction":    features[0].Junction,
		"no_exit":     features[0].NoExit,
		"railway":     features[0].Railway,
		"roundabout":  features[0].Roundabout,
		"station":     features[0].Station,
		"stop":        features[0].Stop,
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
			"severity":          features[0].AverageSeverity,
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

// Define the function to calculate severity based on weather and road data
func calculateSeverity(weather WeatherData, road RoadFeature) float64 {
	// For now, return a hardcoded severity of 2.0
	// You can later add logic to adjust severity based on the input data
	return 5.0
}

func CalculateSeverity(c *gin.Context) {
	// Extract values from query parameters
	temperature := c.DefaultQuery("temperature", "0")
	pressure := c.DefaultQuery("pressure", "0")
	windDirection := c.DefaultQuery("wind_direction", "")
	windSpeed := c.DefaultQuery("wind_speed", "0")
	weatherCondition := c.DefaultQuery("weather_condition", "")

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

	// Convert the extracted query parameters into the WeatherData and RoadFeature structs
	weather := WeatherData{
		Temperature:      parseFloat(temperature),
		Pressure:         parseFloat(pressure),
		WindDirection:    windDirection,
		WindSpeed:        parseFloat(windSpeed),
		WeatherCondition: weatherCondition,
	}

	road := RoadFeature{
		Bump:           bump,
		Crossing:       crossing,
		GiveWay:        giveWay,
		Junction:       junction,
		NoExit:         noExit,
		Railway:        railway,
		Roundabout:     roundabout,
		Station:        station,
		Stop:           stop,
		TrafficCalming: trafficCalming,
		TrafficSignal:  trafficSignal,
	}

	// Calculate the severity
	severity := calculateSeverity(weather, road)

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
	if streetName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "street_name parameter is required"})
		return
	}

	// Encode the street name to handle special characters properly
	encodedStreetName := url.QueryEscape(streetName)

	// Using Nominatim API for geolocation (OpenStreetMap)
	apiURL := fmt.Sprintf("https://nominatim.openstreetmap.org/search?q=%s&format=json", encodedStreetName)
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
		c.JSON(http.StatusNotFound, gin.H{"error": "Street not found"})
		return
	}

	// Get the first result, assuming it's the most relevant one
	lat := geoResults[0]["lat"]
	lon := geoResults[0]["lon"]

	// Convert lat and lon to float64
	latitude, _ := lat.(string)
	longitude, _ := lon.(string)

	c.JSON(http.StatusOK, gin.H{
		"latitude":  latitude,
		"longitude": longitude,
	})
}

// Function to fetch weather and road data for each street
func generateRouteData(starting, destination string) (map[string]StreetData, error) {
	locations := map[string][2]float64{
		"BRICE%20RD": {39.929226798104274, -82.83102723124017},
		"MAIN%20ST":  {39.930000, -82.830000},
		"PARK%20AVE": {39.931000, -82.832000},
		"OAK%20DR":   {39.932000, -82.833000},
	}

	// Prepare a map to store the results
	result := make(map[string]StreetData)

	// Iterate over the hardcoded street locations
	for streetName, coords := range locations {
		// Construct the URL with the correct street name and coordinates
		url := fmt.Sprintf("http://localhost:8080/json/road_features_with_weather?street_name=%s&latitude=%f&longitude=%f",
			streetName, coords[0], coords[1])

		// Log the URL for debugging
		log.Printf("Sending GET request to: %s\n", url)

		// Send the GET request
		resp, err := http.Get(url)
		if err != nil {
			log.Printf("Error fetching data for %s: %v\n", streetName, err)
			continue
		}
		defer resp.Body.Close()

		// Check the response status code
		if resp.StatusCode != http.StatusOK {
			log.Printf("Non-OK status for %s: %d\n", streetName, resp.StatusCode)
			continue
		}

		// Read and log the response body
		body, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			log.Printf("Error reading response body for %s: %v\n", streetName, err)
			continue
		}

		// Log the raw response body for debugging
		log.Printf("Response body for %s: %s\n", streetName, string(body))

		// Parse the JSON response
		var streetData StreetData
		err = json.Unmarshal(body, &streetData)
		if err != nil {
			log.Printf("Error unmarshaling data for %s: %v\n", streetName, err)
			continue
		}

		// Store the result for this street
		result[streetName] = streetData
	}

	return result, nil
}

// HTTP handler to trigger generateRouteData and return the result as JSON
func getStartingDestinationDataHandler(c *gin.Context) {
	// Extract the query parameters
	starting := c.DefaultQuery("starting", "")
	destination := c.DefaultQuery("destination", "")

	// Validate that both parameters are provided
	if starting == "" || destination == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Both 'starting' and 'destination' query parameters are required"})
		return
	}

	// Call the generateRouteData function to get the data
	data, err := generateRouteData(starting, destination)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Error generating route data: %v", err)})
		return
	}

	// Return the data as JSON
	c.JSON(http.StatusOK, data)
}
