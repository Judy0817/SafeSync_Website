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

type SeverityDist struct {
	Severity string `json:"severity"`
	Count    int    `json:"count"`
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
type AccidentSeverityCount struct {
	Year              float64 `json:"year"`
	Severity          float64 `json:"severity"`
	NumberOfAccidents float64 `json:"number_of_accidents"`
}

type TotalAccident struct {
	Year  float64 `json:"year"`
	Count int     `json:"count"`
}

type AccidentDataLocation struct {
	Latitude          float64 `json:"latitude"`
	Longitude         float64 `json:"longitude"`
	City              string  `json:"city"`
	Country           string  `json:"country"`
	Street            string  `json:"street"`
	NumberOfAccidents int     `json:"no_of_accidents"`
	Severity          float64 `json:"severity"` // Add this field for the average severity
	Year              int     `json:"year"`
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

	// Location
	router.GET("/top_city", Top_city)
	router.GET("/top_street", Top_street)
	router.GET("/top_10_streets_per_city", topStreetPerCity)
	router.GET("/get_cities", getCities)
	router.GET("/location_data", LocationAccidentData)
	router.GET("/location_data_all", LocationAccidentDataAll)
	router.GET("/severity_distribution", Severity_Distribution)

	router.GET("/database", getDatabaseName)

	fmt.Println("Server is running on port 8081")
	log.Fatal(http.ListenAndServe(":8081", router))
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

func LocationAccidentData(c *gin.Context) {
	// Get city and year parameters from the query
	city := c.Query("city")
	year := c.DefaultQuery("year", "") // Default to an empty string if not provided

	if city == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "City parameter is required"})
		return
	}

	// Build the query based on the presence of the year parameter
	var query string
	if year != "" {
		// If year is provided, include it in the query filter
		query = "SELECT latitude, longitude, city, country, street, no_of_accidents, avg_severity, year FROM accident_data_location WHERE city = $1 AND year = $2 ORDER BY street"
	} else {
		// If year is not provided, don't filter by year
		query = "SELECT latitude, longitude, city, country, street, no_of_accidents, avg_severity, year FROM accident_data_location WHERE city = $1 ORDER BY street"
	}

	// Query to retrieve accident data for the specified city (and optionally year)
	rows, err := db.Query(query, city, year)
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	// Process query results
	var accidents []AccidentDataLocation
	for rows.Next() {
		var accident AccidentDataLocation
		err := rows.Scan(&accident.Latitude, &accident.Longitude, &accident.City, &accident.Country, &accident.Street, &accident.NumberOfAccidents, &accident.Severity, &accident.Year)
		if err != nil {
			log.Fatal(err)
		}
		accidents = append(accidents, accident)
	}

	// Error check for rows
	if err := rows.Err(); err != nil {
		log.Fatal(err)
	}

	// Log the data to verify it's correct
	log.Printf("Accident Data for %s (Year: %s): %v\n", city, year, accidents)

	// Send JSON response
	c.JSON(http.StatusOK, gin.H{
		"city":          city,
		"year":          year,
		"accident_data": accidents,
	})
}

func LocationAccidentDataAll(c *gin.Context) {
	// Query to retrieve all accident data records
	query := "SELECT latitude, longitude, city, country, street, no_of_accidents, avg_severity, year FROM accident_data_location ORDER BY street"

	// Query to retrieve accident data
	rows, err := db.Query(query)
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	// Process query results
	var accidents []AccidentDataLocation
	for rows.Next() {
		var accident AccidentDataLocation
		err := rows.Scan(&accident.Latitude, &accident.Longitude, &accident.City, &accident.Country, &accident.Street, &accident.NumberOfAccidents, &accident.Severity, &accident.Year)
		if err != nil {
			log.Fatal(err)
		}
		accidents = append(accidents, accident)
	}

	// Error check for rows
	if err := rows.Err(); err != nil {
		log.Fatal(err)
	}

	// Log the data to verify it's correct
	log.Printf("All Accident Data: %v\n", accidents)

	// Send JSON response
	c.JSON(http.StatusOK, gin.H{
		"accident_data": accidents,
	})
}
