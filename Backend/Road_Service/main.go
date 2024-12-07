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
	dbname   = "road_db"
	sslmode  = "disable"
)

// Created Box2, Box3, Box5   ..............

var db *sql.DB

type RoadFeature struct {
	Feature    string  `json:"feature"`
	Percentage float64 `json:"percentage"`
}

type RoadFeaturesCity struct {
	City          string `json:"city"`
	Crossing      int    `json:"crossing"`
	GiveWay       int    `json:"give_way"`
	Junction      int    `json:"junction"`
	Railway       int    `json:"railway"`
	Stop          int    `json:"stop"`
	TrafficSignal int    `json:"traffic_signal"`
}

type RoadFeaturesStreet struct {
	Street        string `json:"street"`
	Crossing      int    `json:"crossing"`
	GiveWay       int    `json:"give_way"`
	Junction      int    `json:"junction"`
	Railway       int    `json:"railway"`
	Stop          int    `json:"stop"`
	TrafficSignal int    `json:"traffic_signal"`
}

type RoadFeatureSeverity struct {
	RoadFeature string `json:"road_feature"`
	Severity1   int    `json:"severity_1"`
	Severity2   int    `json:"severity_2"`
	Severity3   int    `json:"severity_3"`
	Severity4   int    `json:"severity_4"`
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

	// Road Features
	router.GET("/road/road_features", Road_Features)
	router.GET("/road/road_feature_city", GetRoadFeaturesByCity)
	router.GET("/road/road_feature_street", GetRoadFeaturesByStreet)
	router.GET("/road/top3_road_features", Top3_RoadFeatures)
	router.GET("/road/road_feature_by_severity", GetRoadFeaturesBySeverity)

	router.GET("/database", getDatabaseName)

	fmt.Println("Server is running on port 8082")
	log.Fatal(http.ListenAndServe(":8082", router))
}

func getDatabaseName(c *gin.Context) {
	c.String(http.StatusOK, "Database Name: %s\n", dbname)
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

func GetRoadFeaturesByCity(c *gin.Context) {
	// Query to retrieve road features for each city
	rows, err := db.Query("SELECT city, crossing, give_way, junction, railway, stop, traffic_signal FROM road_feature_accidents")
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	var features []RoadFeaturesCity
	for rows.Next() {
		var feature RoadFeaturesCity
		err := rows.Scan(&feature.City, &feature.Crossing, &feature.GiveWay, &feature.Junction, &feature.Railway, &feature.Stop, &feature.TrafficSignal)
		if err != nil {
			log.Fatal(err)
		}
		features = append(features, feature)
	}
	err = rows.Err()
	if err != nil {
		log.Fatal(err)
	}

	// Log the data to verify it's correct
	log.Printf("Road Features: %v\n", features)

	c.JSON(http.StatusOK, gin.H{
		"road_features": features,
	})
}

func GetRoadFeaturesBySeverity(c *gin.Context) {
	// Query to retrieve road features and their severity levels
	rows, err := db.Query("SELECT road_feature, severity_1, severity_2, severity_3, severity_4 FROM road_feature_accidents_by_severity")
	if err != nil {
		log.Fatalf("Error querying database: %v", err)
	}
	defer rows.Close()

	var features []RoadFeatureSeverity
	for rows.Next() {
		var feature RoadFeatureSeverity
		err := rows.Scan(&feature.RoadFeature, &feature.Severity1, &feature.Severity2, &feature.Severity3, &feature.Severity4)
		if err != nil {
			log.Fatalf("Error scanning row: %v", err)
		}
		features = append(features, feature)
	}
	err = rows.Err()
	if err != nil {
		log.Fatalf("Error after iterating rows: %v", err)
	}

	// Log the data to verify it's correct
	log.Printf("Road Features: %v\n", features)

	c.JSON(http.StatusOK, gin.H{
		"road_features": features,
	})
}

func GetRoadFeaturesByStreet(c *gin.Context) {
	// Query to retrieve road features for each city
	rows, err := db.Query("SELECT street, crossing, give_way, junction, railway, stop, traffic_signal FROM road_feature_accidents_By_Street")
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	var features []RoadFeaturesStreet
	for rows.Next() {
		var feature RoadFeaturesStreet
		err := rows.Scan(&feature.Street, &feature.Crossing, &feature.GiveWay, &feature.Junction, &feature.Railway, &feature.Stop, &feature.TrafficSignal)
		if err != nil {
			log.Fatal(err)
		}
		features = append(features, feature)
	}
	err = rows.Err()
	if err != nil {
		log.Fatal(err)
	}

	// Log the data to verify it's correct
	log.Printf("Road Features: %v\n", features)

	c.JSON(http.StatusOK, gin.H{
		"road_features": features,
	})
}
