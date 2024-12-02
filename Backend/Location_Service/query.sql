-- Create the logdb database
CREATE DATABASE testJudy67;
GO
-- Switch to logdb database and create the logdata table
USE logdb;
GO

CREATE TABLE logdata (
    logId NVARCHAR(191) PRIMARY KEY,
    boxId NVARCHAR(191) NOT NULL,
    itemType NVARCHAR(191) NOT NULL,
    userId NVARCHAR(191) NOT NULL,
    totalCount INT NOT NULL,
    startTime DATETIME NOT NULL,
    endTime DATETIME NOT NULL,
    fullLogFile NVARCHAR(MAX) NOT NULL
);
GO