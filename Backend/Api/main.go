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
	router.GET("/weather_conditions", WeatherConditions)
	router.GET("/top_city", Top_city)

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
