-- Active: 1717847768523@@127.0.0.1@5432@json_db
CREATE DATABASE Json_DB;

CREATE TABLE road_features_with_severity (
    street_name TEXT PRIMARY KEY,
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
    average_severity FLOAT
);

SELECT * FROM road_features_with_severity;
