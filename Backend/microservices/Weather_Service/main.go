package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

const (
	host     = "localhost"
	port     = 5432
	user     = "postgres"
	password = "Judy@0817"
	dbname   = "weather_db"
	sslmode  = "disable"
)

// Created Box2, Box3, Box5   ..............

var db *sql.DB

type WeatherCondition struct {
	Condition string
	Count     int
}
type SeverityWeatherCondition struct {
	Severity    int     `json:"severity"`
	Temperature float64 `json:"temperature"`
	Humidity    float64 `json:"humidity"`
	WindSpeed   float64 `json:"wind_speed"`
	Visibility  float64 `json:"visibility"`
}
type WeatherConditionCount struct {
	All_Values string  `json:"all_values"`
	Count      float64 `json:"count"`
}

type AverageWindSpeed struct {
	TimeOfDay        string  `json:"time_of_day"`
	Severity         int     `json:"severity"`
	AverageWindSpeed float64 `json:"average_wind_speed"`
}

type GeoLocation struct {
	Latitude  float64 `json:"lat"`
	Longitude float64 `json:"lon"`
}

type ModelOutputWeatherData struct {
	Humidity      string `json:"humidity(%)"`
	Precipitation string `json:"precipitation(in)"`
	Pressure      string `json:"pressure(in)"`
	Temperature   string `json:"temperature(F)"`
	Visibility    string `json:"visibility(mi)"`
	Weather       string `json:"weather"`
	WindChill     string `json:"wind_chill(F)"`
	WindDirection string `json:"wind_direction"`
	WindSpeed     string `json:"wind_speed(mph)"`
	Severity      string `json:"severity"`
}

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

	// Weather Features
	router.GET("/weather/weather_conditions", WeatherConditions)
	router.GET("/weather/weather_conditions_count", WeatherConditionsCount)
	router.GET("/weather/average_weather_severity", AverageWeatherConditions)
	router.GET("/weather/average_wind_speed", AverageWindSpeeds)

	router.GET("/weather/geolocation", GetGeoLocation)  // For geolocation of street
	router.GET("/weather/weather_data", GetWeatherData) // To get weather data by geolocation

	router.GET("/database", getDatabaseName)
	router.GET("/weather/model_output", getWeatherDataFromModelOutput) // Add this line to use the function

	fmt.Println("Server is running on port 8084")
	log.Fatal(http.ListenAndServe(":8084", router))
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

func GetWeatherData(c *gin.Context) {
	latitude := c.DefaultQuery("latitude", "")
	longitude := c.DefaultQuery("longitude", "")
	if latitude == "" || longitude == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "latitude and longitude parameters are required"})
		return
	}

	// Using OpenWeatherMap API for weather data
	apiKey := "2601fcbe1411562dc72d4050e299d2c7" // Replace with your actual API key
	apiURL := fmt.Sprintf("https://api.openweathermap.org/data/2.5/weather?lat=%s&lon=%s&appid=%s", latitude, longitude, apiKey)
	resp, err := http.Get(apiURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get weather data"})
		return
	}
	defer resp.Body.Close()

	var weatherData map[string]interface{}
	body, _ := ioutil.ReadAll(resp.Body)

	if err := json.Unmarshal(body, &weatherData); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse weather data"})
		return
	}

	// Parse relevant data
	weather := weatherData["weather"].([]interface{})[0].(map[string]interface{})["description"]
	main := weatherData["main"].(map[string]interface{})
	temperature := main["temp"].(float64)
	humidity := main["humidity"].(float64)
	pressure := main["pressure"].(float64)

	// Safely handle the visibility field, ensuring it exists and is a float64
	var visibility float64
	if vis, ok := weatherData["visibility"].(float64); ok {
		visibility = vis
	} else {
		visibility = 0.0 // Default value in case visibility is not present
	}

	wind := weatherData["wind"].(map[string]interface{})
	windSpeed := wind["speed"].(float64)
	windDirection := wind["deg"].(float64)

	// Safely handle the rain field, ensuring it exists
	rain := weatherData["rain"]
	precipitation := 0.0
	if rain != nil {
		// Rain may contain "1h" or "3h", representing hourly or 3-hourly precipitation.
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

	// Format all values to two decimal places
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

	// Save the data to a JSON file
	file, err := os.Create("weather_data.json")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create JSON file"})
		return
	}
	defer file.Close()

	encoder := json.NewEncoder(file)
	encoder.SetIndent("", "  ")
	if err := encoder.Encode(weatherDataFormatted); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to write data to JSON file"})
		return
	}

	// Send response
	c.JSON(http.StatusOK, weatherDataFormatted)
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

func getDatabaseName(c *gin.Context) {
	c.String(http.StatusOK, "Database Name: %s\n", dbname)
}

func WeatherConditions(c *gin.Context) {
	rows, err := db.Query("SELECT weather, count FROM weather_counts")
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	var conditions []WeatherCondition
	for rows.Next() {
		var condition WeatherCondition
		err := rows.Scan(&condition.Condition, &condition.Count)
		if err != nil {
			log.Fatal(err)
		}
		conditions = append(conditions, condition)
	}
	err = rows.Err()
	if err != nil {
		log.Fatal(err)
	}

	var labels []string
	var data []int
	for _, condition := range conditions {
		labels = append(labels, condition.Condition)
		data = append(data, condition.Count)
	}

	// Log the data to verify it's correct
	log.Printf("Labels: %v, Data: %v\n", labels, data)

	c.JSON(http.StatusOK, gin.H{
		"labels": labels,
		"data":   data,
	})
}

func WeatherConditionsCount(c *gin.Context) {
	weather_feature := c.Query("weather_feature")
	if weather_feature == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "weather_feature parameter is required"})
		return
	}

	// Query to select top 10 streets by accident count for the specified city
	rows, err := db.Query("SELECT all_values, count FROM weather_feature_accident_counts WHERE weather_feature = $1 ORDER BY count", weather_feature)
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	// Process query results
	var all_values []WeatherConditionCount
	for rows.Next() {
		var all_value WeatherConditionCount
		err := rows.Scan(&all_value.All_Values, &all_value.Count)
		if err != nil {
			log.Fatal(err)
		}
		all_values = append(all_values, all_value)
	}

	// Error check for rows
	if err := rows.Err(); err != nil {
		log.Fatal(err)
	}

	// Extract labels and data for visualization
	var labels []string
	var data []float64
	for _, all_value := range all_values {
		labels = append(labels, all_value.All_Values)
		data = append(data, all_value.Count)
	}

	// Log the data to verify it's correct
	log.Printf("Top streets in %s: Labels=%v, Data=%v\n", weather_feature, labels, data)

	// Send JSON response
	c.JSON(http.StatusOK, gin.H{
		"weather_feature": weather_feature,
		"labels":          labels,
		"data":            data,
	})
}
func getWeatherDataFromModelOutput(c *gin.Context) {
	// Open the weather data JSON file
	file, err := os.Open("model_output.json") // Ensure the file is in the same directory
	if err != nil {
		log.Println("Error opening weather data file:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not open weather data file"})
		return
	}
	defer file.Close()

	// Decode the weather data from the file
	var weatherData ModelOutputWeatherData
	if err := json.NewDecoder(file).Decode(&weatherData); err != nil {
		log.Println("Error decoding weather data:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not decode weather data"})
		return
	}

	// Respond with the fetched weather data
	c.JSON(http.StatusOK, gin.H{
		"humidity":      weatherData.Humidity,
		"precipitation": weatherData.Precipitation,
		"pressure":      weatherData.Pressure,
		"temperature":   weatherData.Temperature,
		"visibility":    weatherData.Visibility,
		"weather":       weatherData.Weather,
		"windChill":     weatherData.WindChill,
		"windDirection": weatherData.WindDirection,
		"windSpeed":     weatherData.WindSpeed,
		"severity":      weatherData.Severity,
	})
}
func AverageWeatherConditions(c *gin.Context) {
	// Query the database for average weather conditions by severity
	rows, err := db.Query("SELECT severity, temperature, humidity, wind_speed, visibility FROM average_weather_conditions_by_severity")
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	// Slice to store the weather conditions
	var conditions []SeverityWeatherCondition
	for rows.Next() {
		var condition SeverityWeatherCondition
		err := rows.Scan(&condition.Severity, &condition.Temperature, &condition.Humidity, &condition.WindSpeed, &condition.Visibility)
		if err != nil {
			log.Fatal(err)
		}
		conditions = append(conditions, condition)
	}

	// Check for errors after row iteration
	err = rows.Err()
	if err != nil {
		log.Fatal(err)
	}

	// Separate data for grouped bar chart
	var severities []int
	var temperatures, humidities, windSpeeds, visibilities []float64
	for _, condition := range conditions {
		severities = append(severities, condition.Severity)
		temperatures = append(temperatures, condition.Temperature)
		humidities = append(humidities, condition.Humidity)
		windSpeeds = append(windSpeeds, condition.WindSpeed)
		visibilities = append(visibilities, condition.Visibility)
	}

	// Log the data for verification
	log.Printf("Severities: %v\nTemperatures: %v\nHumidities: %v\nWindSpeeds: %v\nVisibilities: %v\n",
		severities, temperatures, humidities, windSpeeds, visibilities)

	// Respond with JSON for frontend charting
	c.JSON(http.StatusOK, gin.H{
		"severities":   severities,
		"temperatures": temperatures,
		"humidities":   humidities,
		"wind_speeds":  windSpeeds,
		"visibilities": visibilities,
	})
}

func AverageWindSpeeds(c *gin.Context) {
	// Query to retrieve average wind speed data
	rows, err := db.Query("SELECT time_of_day, severity, average_wind_speed FROM average_wind_speed_data")
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	var speeds []AverageWindSpeed
	for rows.Next() {
		var speed AverageWindSpeed
		err := rows.Scan(&speed.TimeOfDay, &speed.Severity, &speed.AverageWindSpeed)
		if err != nil {
			log.Fatal(err)
		}
		speeds = append(speeds, speed)
	}
	err = rows.Err()
	if err != nil {
		log.Fatal(err)
	}

	// Log the data to verify it's correct
	log.Printf("Average Wind Speeds: %v\n", speeds)

	c.JSON(http.StatusOK, gin.H{
		"average_wind_speeds": speeds,
	})
}
