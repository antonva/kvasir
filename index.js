var _    = require('lodash');
var xray = require('x-ray');

var base_url = "http://www.vinbudin.is/Desktopdefault.aspx/tabid-54?productID="

//for (var i = 0; i < 99999; ++i) {
	//var pad = "00000";
	//var res = (pad+i).slice(-pad.length)
	xray(base_url + "01514")
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
				store: ['td'],
				units: '.evenRow stockstatus',
			}
		}])
		.run(function(err,array) {
			console.log(array);
		})
		//.paginate('.pagination a:last-child[href]')
		//.limit(10)
		.write('out.json')
//}
