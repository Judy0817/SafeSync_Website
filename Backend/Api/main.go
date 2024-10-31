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
	dbname   = "accident_dashboard"
	sslmode  = "disable"
)

// Created Box2, Box3, Box5   ..............

var db *sql.DB

type RoadFeature struct {
	Feature    string  `json:"feature"`
	Percentage float64 `json:"percentage"`
}

type TopCity struct {
	City  string  `json:"city"`
	Count float64 `json:"accident_count"`
}

type TopStreet struct {
	Street string  `json:"street"`
	Count  float64 `json:"accident_count"`
}
type TopStreetPerCity struct {
	Street string  `json:"street"`
	Count  float64 `json:"accident_count"`
}

type SeverityDist struct {
	Severity string `json:"severity"`
	Count    int    `json:"count"`
}

// Struct for storing accident data
type AccidentData struct {
	Year   int      `json:"year"`
	Labels []string `json:"labels"`
	Data   []int    `json:"data"`
}

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

type TotalAccident struct {
	Year  float64 `json:"year"`
	Count int     `json:"count"`
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

	router.GET("/database", getDatabaseName)
	router.GET("/road_features", Road_Features)
	router.GET("/severity_distribution", Severity_Distribution)
	router.GET("/top3_road_features", Top3_RoadFeatures)
	router.GET("/accidents_2019", getAccidentsDataHandler(2019))
	router.GET("/accidents_2020", getAccidentsDataHandler(2020))
	router.GET("/accidents_2021", getAccidentsDataHandler(2021))
	router.GET("/accidents_2022", getAccidentsDataHandler(2022))
	router.GET("/accidents_2023", getAccidentsDataHandler(2023))
	router.GET("/weather_conditions", WeatherConditions)
	router.GET("/weather_conditions_count", WeatherConditionsCount)
	router.GET("/top_city", Top_city)
	router.GET("/top_street", Top_street)
	router.GET("/top_10_streets_per_city", topStreetPerCity)
	router.GET("/total_accidents", TotalAccidents)
	router.GET("/get_cities", getCities)
	router.GET("/average_weather_severity", AverageWeatherConditions)
	router.GET("/average_wind_speed", AverageWindSpeeds)

	fmt.Println("Server is running on port 8080")
	log.Fatal(http.ListenAndServe(":8080", router))
}

func getDatabaseName(c *gin.Context) {
	c.String(http.StatusOK, "Database Name: %s\n", dbname)
}

func Severity_Distribution(c *gin.Context) {
	rows, err := db.Query("SELECT severity, count FROM severity_distribution")
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	var features []SeverityDist
	for rows.Next() {
		var feature SeverityDist
		err := rows.Scan(&feature.Severity, &feature.Count)
		if err != nil {
			log.Fatal(err)
		}
		features = append(features, feature)
	}
	err = rows.Err()
	if err != nil {
		log.Fatal(err)
	}

	var labels []string
	var data []int
	for _, feature := range features {
		labels = append(labels, feature.Severity)
		data = append(data, int(feature.Count))
	}

	// Log the data to verify it's correct
	log.Printf("Labels: %v, Data: %v\n", labels, data)

	c.JSON(http.StatusOK, gin.H{
		"labels": labels,
		"data":   data,
	})
}

func Road_Features(c *gin.Context) {
	rows, err := db.Query("SELECT feature, percentage FROM road_features")
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	var features []RoadFeature
	for rows.Next() {
		var feature RoadFeature
		err := rows.Scan(&feature.Feature, &feature.Percentage)
		if err != nil {
			log.Fatal(err)
		}
		features = append(features, feature)
	}
	err = rows.Err()
	if err != nil {
		log.Fatal(err)
	}

	var labels []string
	var data []float64
	for _, feature := range features {
		labels = append(labels, feature.Feature)
		data = append(data, feature.Percentage)
	}

	// Log the data to verify it's correct
	log.Printf("Labels: %v, Data: %v\n", labels, data)

	c.JSON(http.StatusOK, gin.H{
		"labels": labels,
		"data":   data,
	})
}

// New function to get top 3 road features by percentage
func Top3_RoadFeatures(c *gin.Context) {
	rows, err := db.Query("SELECT feature, percentage FROM road_features ORDER BY percentage DESC LIMIT 3")
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	var features []RoadFeature
	for rows.Next() {
		var feature RoadFeature
		err := rows.Scan(&feature.Feature, &feature.Percentage)
		if err != nil {
			log.Fatal(err)
		}
		features = append(features, feature)
	}
	err = rows.Err()
	if err != nil {
		log.Fatal(err)
	}

	c.JSON(http.StatusOK, features)
}

// Function to fetch accidents data for a specific year
func getAccidentsDataHandler(year int) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Query to retrieve data for the given year from accidents table
		query := fmt.Sprintf("SELECT month, accidents FROM accidents_%d", year)
		rows, err := db.Query(query)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to execute query",
			})
			return
		}
		defer rows.Close()

		var labels []string
		var data []int
		for rows.Next() {
			var yearMonth string
			var accidents int
			err := rows.Scan(&yearMonth, &accidents)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Error scanning row",
				})
				return
			}
			labels = append(labels, yearMonth)
			data = append(data, accidents)
		}
		if err := rows.Err(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Error iterating over rows",
			})
			return
		}

		// Log the data to verify it's correct (optional)
		log.Printf("Accidents data for %d: Labels=%v, Data=%v\n", year, labels, data)

		// Prepare JSON response
		accidentData := AccidentData{
			Year:   year,
			Labels: labels,
			Data:   data,
		}
		c.JSON(http.StatusOK, accidentData)
	}
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

func Top_city(c *gin.Context) {
	rows, err := db.Query("SELECT city, accident_count FROM top_city")
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	var cities []TopCity
	for rows.Next() {
		var city TopCity
		err := rows.Scan(&city.City, &city.Count)
		if err != nil {
			log.Fatal(err)
		}
		cities = append(cities, city)
	}
	err = rows.Err()
	if err != nil {
		log.Fatal(err)
	}

	var labels []string
	var data []float64
	for _, city := range cities {
		labels = append(labels, city.City)
		data = append(data, city.Count)
	}

	// Log the data to verify it's correct
	log.Printf("Labels: %v, Data: %v\n", labels, data)

	c.JSON(http.StatusOK, gin.H{
		"labels": labels,
		"data":   data,
	})
}

func Top_street(c *gin.Context) {
	rows, err := db.Query("SELECT street, accident_count FROM top_street")
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	var streets []TopStreet
	for rows.Next() {
		var city TopStreet
		err := rows.Scan(&city.Street, &city.Count)
		if err != nil {
			log.Fatal(err)
		}
		streets = append(streets, city)
	}
	err = rows.Err()
	if err != nil {
		log.Fatal(err)
	}

	var labels []string
	var data []float64
	for _, street := range streets {
		labels = append(labels, street.Street)
		data = append(data, street.Count)
	}

	// Log the data to verify it's correct
	log.Printf("Labels: %v, Data: %v\n", labels, data)

	c.JSON(http.StatusOK, gin.H{
		"labels": labels,
		"data":   data,
	})
}

// Handler function to get the total accidents by city (you can adjust this logic)
func TotalAccidents(c *gin.Context) {
	// Query the database for total accidents
	rows, err := db.Query("SELECT year, count FROM total_accidents")
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	// Slice to hold the results
	var years []TotalAccident
	for rows.Next() {
		var year TotalAccident
		err := rows.Scan(&year.Year, &year.Count)
		if err != nil {
			log.Fatal(err)
		}
		years = append(years, year)
	}

	// Check for any errors during iteration
	err = rows.Err()
	if err != nil {

		log.Fatal(err)
	}

	// Prepare labels and data for JSON response
	var labels []string
	var data []float64
	for _, year := range years {
		labels = append(labels, fmt.Sprintf("%.0f", year.Year)) // Convert year to string without decimal
		data = append(data, float64(year.Count))                // Count already an integer, convert to float64
	}

	// Log the data to verify it's correct
	log.Printf("Labels: %v, Data: %v\n", labels, data)

	// Send JSON response
	c.JSON(http.StatusOK, gin.H{
		"labels": labels,
		"data":   data,
	})
}

func topStreetPerCity(c *gin.Context) {
	city := c.Query("city")
	if city == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "City parameter is required"})
		return
	}

	// Query to select top 10 streets by accident count for the specified city
	rows, err := db.Query("SELECT street, accident_count FROM top_10_streets_per_city WHERE city = $1 ORDER BY accident_count DESC LIMIT 10", city)
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	// Process query results
	var streets []TopStreetPerCity
	for rows.Next() {
		var street TopStreetPerCity
		err := rows.Scan(&street.Street, &street.Count)
		if err != nil {
			log.Fatal(err)
		}
		streets = append(streets, street)
	}

	// Error check for rows
	if err := rows.Err(); err != nil {
		log.Fatal(err)
	}

	// Extract labels and data for visualization
	var labels []string
	var data []float64
	for _, street := range streets {
		labels = append(labels, street.Street)
		data = append(data, street.Count)
	}

	// Log the data to verify it's correct
	log.Printf("Top streets in %s: Labels=%v, Data=%v\n", city, labels, data)

	// Send JSON response
	c.JSON(http.StatusOK, gin.H{
		"city":   city,
		"labels": labels,
		"data":   data,
	})
}

func getCities(c *gin.Context) {
	// Query to select distinct cities from your database
	rows, err := db.Query("SELECT DISTINCT city FROM top_10_streets_per_city")
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	var cities []string
	for rows.Next() {
		var city string
		err := rows.Scan(&city)
		if err != nil {
			log.Fatal(err)
		}
		cities = append(cities, city)
	}

	if err := rows.Err(); err != nil {
		log.Fatal(err)
	}

	// Send JSON response
	c.JSON(http.StatusOK, gin.H{"cities": cities})
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
