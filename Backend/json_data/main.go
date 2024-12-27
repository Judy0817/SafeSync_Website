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
	dbname   = "json_db"
	sslmode  = "disable"
)

// RoadFeature represents the structure of a row in the database
type RoadFeature struct {
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

	// Define routes
	router.GET("/road_features_with_severity", GetRoadFeatures)
	// Define the new route
	router.GET("/street_names", GetStreetNames)

	// Start server
	router.Run(":8080")
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

// GetRoadFeatures handles requests to fetch road features for a specific street name
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

	var features []RoadFeature
	for rows.Next() {
		var feature RoadFeature
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
