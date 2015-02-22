var _    = require('lodash');
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
			store: ['.store, .stockstatus'],
			
		}
	}])
	.run(function(err, array) {
		var a      = array[0];
		var s      = a.stock_updated.slice(1,-1);
		var tmp    = s.split(" ") ;
		tmp[0]     = tmp[0].split(".");
		tmp[1]     = tmp[1].split(":");
		var second, minute, hour, day, month, year;
		second = "00";	
		minute = tmp[1][1];
		hour   = tmp[1][0];
		day    = tmp[0][0];
		month  = ('0'+ tmp[0][1]).slice(-2);
		year   = tmp[0][2];
		var date = year+"-"+month+"-"+day+" "+hour+":"+minute+":"+second;

		var client = new pg.Client({
			user: 'kvasir',
			database: 'mjodr',
			host: 'localhost'
		});

		client.connect(function(err) {
			if(err) {
				return console.error(err);
			}
			client.query({
				text: "SELECT upsert_item($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);",
				values: [ 
						a.product_id,
						a.product_name,
						a.price,
						a.abv,
						a.volume,
						a.vintage,
						a.importer,
						a.country,
						a.category,
						a.description,
						a.stock_updated
					]
			}, function(err, result) {
				if(err) {
					console.log(JSON.stringify(err));
					return console.error(err)
				}
				done;
				//do stuff.
			});
		});
		client.end();

	})
