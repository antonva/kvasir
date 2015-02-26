CREATE TABLE IF NOT EXISTS item (
	id            INTEGER NOT NULL, 
	name          TEXT    NOT NULL,
	volume        TEXT    NOT NULL,
	price         INTEGER,
	abv           REAL    NOT NULL,
	vintage       INTEGER,
	importer      TEXT,
	country       TEXT,
	category      TEXT    NOT NULL,
	description   TEXT    NOT NULL,
	stock_updated TIMESTAMP,

	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS stock (
	product_id INTEGER NOT NULL,
	store      TEXT    NOT NULL,
	stock      INTEGER NOT NULL,

	PRIMARY KEY (product_id, store, stock),
	FOREIGN KEY (product_id) REFERENCES item (id)
);

DROP FUNCTION IF EXISTS upsert_item(
	u_id            int, 
	u_name          text,
	u_volume        text,
	u_price         int,
	u_abv           real,
	u_vintage       int,
	u_importer      text,
	u_country       text,
	u_category      text,
	u_description   text,
	u_stock_updated timestamp
);

-- We upsert now.
CREATE FUNCTION upsert_item(
	u_id            INT, 
	u_name          TEXT,
	u_volume        TEXT,
	u_price         INT,
	u_abv           REAL,
	u_vintage       INT,
	u_importer      TEXT,
	u_country       TEXT,
	u_category      TEXT,
	u_description   TEXT,
	u_stock_updated timestamp
) returns void as
$$ BEGIN
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
		description   = u_description,
		stock_updated = u_stock_updated
		WHERE id = u_id;
		IF found THEN
			RETURN;
		END IF;
		-- not there, so try to insert the key
		-- if someone else inserts the same key concurrently,
		-- we could get a unique-key failure
		BEGIN
			INSERT INTO item(
				id, 
				name, 
				volume,
				price, 
				abv, 
				vintage, 
				importer,
				country,
				category,
				description,
				stock_updated
			) VALUES (
				u_id,
				u_name,
				u_volume,
				u_price,
				u_abv,
				u_vintage,
				u_importer,
				u_country, 
				u_category,
				u_description,
				u_stock_updated
			);
			RETURN;
		EXCEPTION WHEN unique_violation THEN
		-- Do nothing, and loop to try the UPDATE again.
		END;
	END LOOP;
END;
$$

DROP FUNCTION IF EXISTS upsert_stock(
	u_id	INT,
	u_store TEXT,
	u_stock INT,
);
CREATE FUNCTION upsert_item(
	u_id	INT,
	u_store TEXT,
	u_stock INT,
) returns void as
$$ BEGIN
	LOOP
		-- first try to update the key
		UPDATE stock SET 
		store = u_store,
		stock = u_stock
		WHERE product_id = u_id;
		IF found THEN
			RETURN;
		END IF;
		-- not there, so try to insert the key
		-- if someone else inserts the same key concurrently,
		-- we could get a unique-key failure
		BEGIN
			INSERT INTO stock(
				product_id,
				store,
				stock
			) VALUES (
				u_id,
				u_store,
				u_stock
			);
			RETURN;
		EXCEPTION WHEN unique_violation THEN
		-- Do nothing, and loop to try the UPDATE again.
		END;
	END LOOP;

$$
LANGUAGE plpgsql;
