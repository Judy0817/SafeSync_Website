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

type DaywiseAccidentCount struct {
	DayName       string `json:"day_name"`
	DayType       string `json:"day_type"`
	AccidentCount int    `json:"accident_count"`
}

type PerHourAccidentCount struct {
	Day           string  `json:"day"`
	Hour          float64 `json:"hour"`           // Use float64 to match the hour data type
	AccidentCount float64 `json:"accident_count"` // Use float64 to match the accident_count data type
}
type TotalAccident struct {
	Year  float64 `json:"year"`
	Count int     `json:"count"`
}
type AccidentSeverityCount struct {
	Year              float64 `json:"year"`
	Severity          float64 `json:"severity"`
	NumberOfAccidents float64 `json:"number_of_accidents"`
}
type AccidentData struct {
	Year   int      `json:"year"`
	Labels []string `json:"labels"`
	Data   []int    `json:"data"`
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

	// Time based
	router.GET("/accidents_2019", getAccidentsDataHandler(2019))
	router.GET("/accidents_2020", getAccidentsDataHandler(2020))
	router.GET("/accidents_2021", getAccidentsDataHandler(2021))
	router.GET("/accidents_2022", getAccidentsDataHandler(2022))
	router.GET("/accidents_2023", getAccidentsDataHandler(2023))
	router.GET("/total_accidents", TotalAccidents)
	router.GET("/day_wise_count", GetDaywiseAccidentCounts)
	router.GET("/per_hour_count", PerHourAccidentCounts)
	router.GET("/per_severity_year_count", PerSeverityAccidentCounts)

	router.GET("/database", getDatabaseName)

	fmt.Println("Server is running on port 8083")
	log.Fatal(http.ListenAndServe(":8083", router))
}

func getDatabaseName(c *gin.Context) {
	c.String(http.StatusOK, "Database Name: %s\n", dbname)
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

func GetDaywiseAccidentCounts(c *gin.Context) {
	// Query to retrieve accident counts for each day
	rows, err := db.Query("SELECT day_name, day_type, accident_count FROM daywise_accident_counts")
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	var counts []DaywiseAccidentCount
	for rows.Next() {
		var count DaywiseAccidentCount
		err := rows.Scan(&count.DayName, &count.DayType, &count.AccidentCount)
		if err != nil {
			log.Fatal(err)
		}
		counts = append(counts, count)
	}
	err = rows.Err()
	if err != nil {
		log.Fatal(err)
	}

	// Log the data to verify it's correct
	log.Printf("Daywise Accident Counts: %v\n", counts)

	// Send JSON response
	c.JSON(http.StatusOK, gin.H{
		"daywise_accident_counts": counts,
	})
}

func PerHourAccidentCounts(c *gin.Context) {
	// Query to retrieve accident counts for each day and hour
	rows, err := db.Query("SELECT day, hour, accident_count FROM average_count_perhour ORDER BY day, hour")
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	var counts []PerHourAccidentCount
	for rows.Next() {
		var count PerHourAccidentCount
		err := rows.Scan(&count.Day, &count.Hour, &count.AccidentCount)
		if err != nil {
			log.Fatal(err)
		}
		counts = append(counts, count)
	}
	err = rows.Err()
	if err != nil {
		log.Fatal(err)
	}

	// Log the data to verify it's correct
	log.Printf("Daywise Accident Counts: %v\n", counts)

	// Send JSON response
	c.JSON(http.StatusOK, gin.H{
		"daywise_accident_counts": counts,
	})
}

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

func PerSeverityAccidentCounts(c *gin.Context) {
	// Query to retrieve accident severity counts
	rows, err := db.Query("SELECT year, severity, number_of_accidents FROM accident_severity_counts ORDER BY year, severity")
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	var counts []AccidentSeverityCount
	for rows.Next() {
		var count AccidentSeverityCount
		err := rows.Scan(&count.Year, &count.Severity, &count.NumberOfAccidents)
		if err != nil {
			log.Fatal(err)
		}
		counts = append(counts, count)
	}
	err = rows.Err()
	if err != nil {
		log.Fatal(err)
	}

	// Log the data to verify it's correct
	log.Printf("Accident Severity Counts: %v\n", counts)

	// Send JSON response
	c.JSON(http.StatusOK, gin.H{
		"accident_severity_counts": counts,
	})
}
