-- Active: 1717847768523@@127.0.0.1@5432@time_db

CREATE DATABASE Time_DB;

CREATE TABLE IF NOT EXISTS accidents_2019 (
    month VARCHAR(255) UNIQUE,
    accidents INT
)

CREATE TABLE IF NOT EXISTS accidents_2020 (
    month VARCHAR(255) UNIQUE,
    accidents INT
)

CREATE TABLE IF NOT EXISTS accidents_2021 (
    month VARCHAR(255) UNIQUE,
    accidents INT
)

CREATE TABLE IF NOT EXISTS accidents_2022 (
    month VARCHAR(255) UNIQUE,
    accidents INT
)

CREATE TABLE IF NOT EXISTS accidents_2023 (
    month VARCHAR(255) UNIQUE,
    accidents INT
)

CREATE TABLE IF NOT EXISTS daywise_accident_counts (
    day_name VARCHAR(50),
    day_type VARCHAR(50),
    accident_count INT,
    PRIMARY KEY (day_name)
)

CREATE TABLE average_count_perhour (
    day VARCHAR(50),
    hour FLOAT,
    accident_count FLOAT,
    PRIMARY KEY (day, hour)  -- Combined primary key for day and hour
)

CREATE TABLE IF NOT EXISTS total_accidents (
    year INT PRIMARY KEY,
    count INT
)

CREATE TABLE accident_severity_counts (
    year FLOAT,
    severity FLOAT,
    number_of_accidents FLOAT,
    PRIMARY KEY (year, severity)  -- Combined primary key for year and severity
)