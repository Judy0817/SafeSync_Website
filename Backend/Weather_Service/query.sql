-- Active: 1717847768523@@127.0.0.1@5432@weather_db

CREATE DATABASE Weather_DB;

CREATE TABLE IF NOT EXISTS weather_feature_accident_counts (
    weather_feature VARCHAR(255),
    all_values VARCHAR(255),
    count INT,
    PRIMARY KEY (weather_feature, all_values)
)

CREATE TABLE IF NOT EXISTS average_wind_speed_data (
    time_of_day VARCHAR(255),
    severity INT,
    average_wind_speed FLOAT,
    PRIMARY KEY (time_of_day, severity)
)

CREATE TABLE IF NOT EXISTS average_weather_conditions_by_severity (
    severity INT PRIMARY KEY,
    temperature FLOAT,
    humidity FLOAT,
    wind_speed FLOAT,
    visibility FLOAT
)

CREATE TABLE IF NOT EXISTS weather_counts (
    weather VARCHAR(255) UNIQUE,
    count INT
)

