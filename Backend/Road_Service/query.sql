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