CREATE TABLE IF NOT EXISTS item (
	product_id INTEGER NOT NULL, 
	name VARCHAR(255) NOT NULL,
	price INTEGER NOT NULL,
	abv FLOAT REAL NOT NULL,
	volume INTEGER NOT NULL,
	vintage INTEGER,
	importer VARCHAR(255) NOT NULL,
	country VARCHAR(255) NOT NULL,
	category VARCHAR(255) NOT NULL,
	stock updated 

	PRIMARY KEY (product_id)
);

CREATE TABLE IF NOT EXISTS distances (
	system_1 VARCHAR(255) NOT NULL,
	system_2 VARCHAR(255) NOT NULL,
	distance REAL NOT NULL,

	PRIMARY KEY (system_1, system_2),
	FOREIGN KEY (system_1) REFERENCES systems (name),
	FOREIGN KEY (system_2) REFERENCES systems (name)
);
