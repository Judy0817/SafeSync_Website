package main




import (
	"database/sql"
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

const (
	host     = "localhost"
	port     = 5432
	user     = "postgres"
	password = "Judy@0817"
	dbname   = "accident_dashboard"
)

var db *sql.DB

type RoadFeature struct {
	Feature    string  `json:"feature"`
	Percentage float64 `json:"percentage"`
}

func main() {
	// Connection string
	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	// Open a database connection
	var err error
	db, err = sql.Open("postgres", psqlInfo)
	if err != nil {
		log.Fatalf("Error opening database: %v", err)
	}

	// Check the connection
	err = db.Ping()
	if err != nil {
		log.Fatalf("Error connecting to the database: %v", err)
	}

	fmt.Println("Successfully connected to the database!")

	// Set up Gin router
	router := gin.Default()

	// Define routes
	router.GET("/database", getDatabaseName)
	router.GET("/table_data", getTableData)

	// Start the HTTP server
	fmt.Println("Server is running on port 8080")
	log.Fatal(router.Run(":8080"))
}

func getDatabaseName(c *gin.Context) {
	c.String(http.StatusOK, "Database Name: %s\n", dbname)
}

func getTableData(c *gin.Context) {
	// Query the road_features table
	rows, err := db.Query("SELECT feature, percentage FROM road_features")
	if err != nil {
		log.Fatalf("Error querying database: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	// Iterate over the result set and construct RoadFeature objects
	var roadFeatures []RoadFeature
	for rows.Next() {
		var rf RoadFeature
		if err := rows.Scan(&rf.Feature, &rf.Percentage); err != nil {
			log.Fatalf("Error scanning row: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		roadFeatures = append(roadFeatures, rf)
	}

	// Check for errors from iterating over rows.
	if err = rows.Err(); err != nil {
		log.Fatalf("Error iterating over rows: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Respond with the road features as JSON
	c.JSON(http.StatusOK, roadFeatures)
}
