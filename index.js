var xray = require('x-ray');
var pg   = require('pg');

var base_url = "http://www.vinbudin.is/Desktopdefault.aspx/tabid-54?productID="

var url = process.argv[2];
xray(url)
	.select([{
		$root:         '.product-detail',
		product_name:  '#ctl01_ctl00_Label_ProductName',
		product_id:    '#ctl01_ctl00_Label_ProductID',
		price:         '#ctl01_ctl00_Label_ProductPrice',
		abv:           '#ctl01_ctl00_Label_ProductAlchoholVolume',
		volume:        '#ctl01_ctl00_Label_ProductBottledVolume',
		vintage:       '#ctl01_ctl00_Label_ProductYear',
		importer:      '#ctl01_ctl00_Label_ProductSeller',
		country:       '#ctl01_ctl00_Label_ProductCountryOfOrigin',
		category:      '#ctl01_ctl00_Label_ProductSubCategory',
		description:   '#ctl01_ctl00_Label_ProductDescription',
		stock_updated: '#ctl01_ctl00_span_stockStatusLastUpdated strong', 
		availability: { 
			$root: '.tableStockStatus', 
			store: ['.store'],
			store_stock: ['.stockstatus'],
			
		}
	}])
	.run(function(err, array) {
		var obj = parse_stock_data(array[0])
		console.log(JSON.stringify(array[0], null, 4));
		if (obj.product_name == "Engar upplýsingar") {
			return;
		} else if (obj.price == "Ekkert verð") {          // Consider removing this conditional since a lot of products
			console.log("No price, skipping.");     // seem to have no price on web.
			return
		} else {
			obj = prepare_data(obj);
			update_db(obj);
		}
	})

// Tries to update values in database, if product does not exist, inserts the data instead.
// NOTE: uses a custom upsert_item function defined in CREATE.sql
function update_db(obj) {
	pg.connect('pg://kvasir@localhost/mjodr', function(err, client, done) {
		if(err) {
			return console.error(err);
		}
		client.query({
			text: "SELECT upsert_item($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);",
			values: [ 
				obj.product_id,
				obj.product_name,
				obj.volume,
				obj.price,
				obj.abv,
				obj.vintage,
				obj.importer,
				obj.country,
				obj.category,
				obj.description,
				obj.stock_updated
			]
		}, function(err, result) {
			if(err) {
				return console.error(err)
			}
			console.log("Logged.");
			done();
		});
		done();
	});
	pg.end();
};

// Parses stock_updated to ISO time and formats price as integer and abv as float.
function prepare_data(obj) {
	if (obj.stock_updated != undefined) {
		// Horrible.
		var s, tmp, second, minute, hour, day, month, year;
		s      = obj.stock_updated.slice(1,-1);
		tmp    = s.split(" ") ;
		tmp[0] = tmp[0].split(".");
		tmp[1] = tmp[1].split(":");
		second = "00";	
		minute = tmp[1][1];
		hour   = tmp[1][0];
		day    = tmp[0][0];
		month  = ('0'+ tmp[0][1]).slice(-2);
		year   = tmp[0][2];
		obj.stock_updated = year+"-"+month+"-"+day+" "+hour+":"+minute+":"+second;
	}
	obj.price = obj.price.split('.').join("").split(" ")[0];
	obj.abv   = obj.abv.split(',').join(".");
	return obj;
};

// Parses the stock status into a single array of objects.
function parse_stock_data(obj) {
	obj.availability.stock = [];
	for ( var i = 0; i < obj.availability.store.length; ++i) {
		var s = obj.availability.store[i];
		var n = obj.availability.store_stock[i];
		var temp_obj = {}
		temp_obj[s]  = n;
		obj.availability.stock.push(temp_obj);	
	}
	delete obj.availability.store;
	delete obj.availability.store_stock;
	return obj;
};
