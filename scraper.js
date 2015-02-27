var util  = require('util'),
    xray  = require('x-ray'),
    pg    = require('pg'),
    async = require('async'),

function Scraper() {
	
	this.baseUrl = "http://www.vinbudin.is/Desktopdefault.aspx/tabid-54?productID=";

	// The scraper class' template;.
	this.template = [{
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
		stock: {},
	}];

}

util.inherits(Login,EventEmitter);
