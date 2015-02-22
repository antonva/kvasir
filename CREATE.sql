CREATE TABLE IF NOT EXISTS item (
	id            INTEGER NOT NULL, 
	name          TEXT NOT NULL,
	volume        INTEGER NOT NULL,
	price         INTEGER NOT NULL,
	abv           REAL NOT NULL,
	vintage       INTEGER,
	importer      TEXT NOT NULL,
	country       TEXT NOT NULL,
	category      TEXT NOT NULL,
	stock_updated TIMESTAMP NOT NULL,

	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS inventory (
	product_id INTEGER NOT NULL,
	store      VARCHAR(255) NOT NULL,
	stock      INTEGER NOT NULL,

	PRIMARY KEY (product_id),
	FOREIGN KEY (product_id) REFERENCES item (id)
);

DROP FUNCTION IF EXISTS upsert_item(
	u_id            int, 
	u_name          text,
	u_volume        int,
	u_price         int,
	u_abv           real,
	u_vintage       int,
	u_importer      text,
	u_country       text,
	u_category      text,
	u_stock_updated timestamp
);

-- We upsert now.
CREATE FUNCTION upsert_item(
	u_id            int, 
	u_name          text,
	u_volume        int,
	u_price         int,
	u_abv           real,
	u_vintage       int,
	u_importer      text,
	u_country       text,
	u_category      text,
	u_stock_updated timestamp) returns void as
$$
BEGIN
	LOOP
		-- first try to update the key
		UPDATE item SET 
		name          = u_name,
		volume        = u_volume,
		price         = u_price,
		abv           = u_abv,
		vintage       = u_vintage,
		importer      = u_importer,
		country       = u_country, 
		category      = u_category,
		stock_updated = u_stock_updated
		WHERE id = u_id;
		IF found THEN
			RETURN;
		END IF;
		-- not there, so try to insert the key
		-- if someone else inserts the same key concurrently,
		-- we could get a unique-key failure
		BEGIN
			INSERT INTO db(
				id, 
				name, 
				volume,
				price, 
				abv, 
				vintage, 
				importer,
				country,
				category,
				stock_updated
			) VALUES (
				u_name,
				u_volume,
				u_price,
				u_abv,
				u_vintage,
				u_importer,
				u_country, 
				u_category,
				u_stock_updated
			);
			RETURN;
		EXCEPTION WHEN unique_violation THEN
		-- Do nothing, and loop to try the UPDATE again.
		END;
	END LOOP;
END;
$$
LANGUAGE plpgsql;
