-- Active: 1717847768523@@127.0.0.1@5432@accident_dashboard


CREATE TABLE road_features(feature varchar(50), percentage float)

INSERT INTO road_features(feature, percentage) VALUES ('Roundabout', 0.003221885)

SELECT * FROM road_features;

SELECT * FROM top_city;
-- DROP TABLE road_features;