var _    = require('lodash');
var xray = require('x-ray');
var pg   = require('pg');

var conString = "postgres://kvasir@localhost/mjodr";

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
		var client = new pg.Client(conString)
		client.connect(function(err) {
			if(err) {
				return console.error('could not connect to postgres', err);
			}
			client.query("", function(err, result) {
				if(err) {
					return console.error('error running query', err);
				}
				//do stuff.
				client.end();
			});
		});

	})
