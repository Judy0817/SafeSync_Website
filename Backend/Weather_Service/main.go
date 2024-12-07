package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"

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

	router.GET("/database", getDatabaseName)

	fmt.Println("Server is running on port 8084")
	log.Fatal(http.ListenAndServe(":8084", router))
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
