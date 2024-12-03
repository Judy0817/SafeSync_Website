-- Active: 1717847768523@@127.0.0.1@5432@location_db
-- Create the Location_DB database
CREATE DATABASE Location_DB;

-- DROP TABLE road_feature_accidents;

-- SELECT pid, usename, application_name, client_addr, client_hostname, backend_start, state
-- FROM pg_stat_activity
-- WHERE datname = 'accident_dashboard';

-- SELECT pg_terminate_backend(pid)
-- FROM pg_stat_activity
-- WHERE datname = 'accident_dashboard' AND pid <> pg_backend_pid();


CREATE TABLE accident_data_location (
    latitude FLOAT,
    longitude FLOAT,
    city TEXT,
    country TEXT,
    street TEXT,
    no_of_accidents INT,
    avg_severity FLOAT,  -- Severity is now a FLOAT column
    year INT,            -- Added year column
    PRIMARY KEY (latitude, longitude, street, year)  -- Combined primary key for latitude, longitude, street, and year
)

CREATE TABLE IF NOT EXISTS road_feature_accidents (
    city VARCHAR(50) PRIMARY KEY,
    crossing INT,
    give_way INT,
    junction INT,
    railway INT,
    stop INT,
    traffic_signal INT
)

CREATE TABLE IF NOT EXISTS top_street (
    street VARCHAR(255) UNIQUE,
    accident_count INT
)

CREATE TABLE IF NOT EXISTS top_10_streets_per_city (
    city VARCHAR(255),
    street VARCHAR(255),
    accident_count INT,
    PRIMARY KEY (city, street)
)

CREATE TABLE IF NOT EXISTS top_city (
    city VARCHAR(255) UNIQUE,
    accident_count INT
)

CREATE TABLE IF NOT EXISTS severity_distribution (
    severity VARCHAR(255) UNIQUE,
    count INT
)

CREATE TABLE IF NOT EXISTS total_accidents (
    year INT PRIMARY KEY,
    count INT
)