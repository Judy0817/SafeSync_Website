-- Active: 1717847768523@@127.0.0.1@5432@json_db
CREATE DATABASE Json_DB;

CREATE TABLE road_features_with_severity (
    street_name TEXT,
    city_name TEXT,
    county_name TEXT,
    bump BOOLEAN,
    crossing BOOLEAN,
    give_way BOOLEAN,
    junction BOOLEAN,
    no_exit BOOLEAN,
    railway BOOLEAN,
    roundabout BOOLEAN,
    station BOOLEAN,
    stop BOOLEAN,
    traffic_calming BOOLEAN,
    traffic_signal BOOLEAN,
    average_severity NUMERIC
);


SELECT * FROM road_features_with_severity;

SELECT * FROM road_features_with_severity WHERE street_name = 'FRANTZ RD' AND city_name = 'DUBLIN' AND county_name = 'FRANKLIN';


SELECT * FROM street_geo_locations;


CREATE TABLE street_geo_locations (
    id SERIAL PRIMARY KEY,
    street_name VARCHAR(255),
    city VARCHAR(255),
    county VARCHAR(255),
    geo_locations JSONB
);

SELECT PostGIS_full_version();

CREATE EXTENSION postgis;


