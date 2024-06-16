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

var db *sql.DB

type RoadFeature struct {
	Feature    string  `json:"feature"`
	Percentage float64 `json:"percentage"`
}

type SeverityDist struct {
	Severity string `json:"severity"`
	Count    int    `json:"count"`
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
