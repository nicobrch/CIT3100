CREATE TABLE Admin (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL
);

CREATE TABLE Company (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT NOT NULL,
    company_api_key TEXT NOT NULL
);

CREATE TABLE Location (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    location_name TEXT NOT NULL,
    location_country TEXT NOT NULL,
    location_city TEXT NOT NULL,
    location_meta TEXT,
    FOREIGN KEY (company_id) REFERENCES Company(id)
);

CREATE TABLE Sensor (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    location_id INTEGER NOT NULL,
    sensor_name TEXT NOT NULL,
    sensor_category TEXT NOT NULL,
    sensor_meta TEXT,
    sensor_api_key TEXT NOT NULL,
    FOREIGN KEY (location_id) REFERENCES Location(id)
);

CREATE TABLE SensorData (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sensor_id INTEGER NOT NULL,
    data JSON NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sensor_id) REFERENCES Sensor(id)
);

INSERT INTO Admin (username, password) VALUES ('admin', 'admin');