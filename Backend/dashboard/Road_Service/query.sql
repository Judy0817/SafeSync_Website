-- Active: 1717847768523@@127.0.0.1@5432@road_db

CREATE DATABASE Road_DB;


CREATE TABLE IF NOT EXISTS road_feature_accidents_By_Street (
    street VARCHAR(50) PRIMARY KEY,
    crossing INT,
    give_way INT,
    junction INT,
    railway INT,
    stop INT,
    traffic_signal INT
) 

CREATE TABLE IF NOT EXISTS road_features (
    feature VARCHAR(255) UNIQUE,
    percentage FLOAT
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

CREATE TABLE IF NOT EXISTS road_feature_accidents_by_severity(
    road_feature VARCHAR(50) PRIMARY KEY,
    severity_1 INT,
    severity_2 INT,
    severity_3 INT,
    severity_4 INT
)