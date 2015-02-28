var util   = require('util'),
    events = require('events'),
    xray   = require('x-ray');


function Scraper(base_url, template) {
    var self = this;
    this.base_url = base_url;
    this.template = template;

    this.get_item = function(url) {
	xray(url)
	    .select(this.template)
	    .run(function(err, array) {
		if (err) { console.log(err) };
		self.emit('got_item', array[0]);
	    })
    };

    this.parse_item = function(obj) {
	if (obj.stock_updated != undefined) {
	    // Horrible time format gets horrible parsing
	    var slice, tmp, ss, mm, hh, dd, mo, yy;
	    slice  = obj.stock_updated.slice(1,-1);
	    tmp    = slice.split(" ") ;
	    tmp[0] = tmp[0].split(".");
	    tmp[1] = tmp[1].split(":");
	    ss     = "00";	
	    mm     = tmp[1][1];
	    hh     = tmp[1][0];
	    dd     = tmp[0][0];
	    mo     = ('0'+ tmp[0][1]).slice(-2);
	    yy     = tmp[0][2];
	    obj.stock_updated = yy+"-"+mo+"-"+dd+" "+hh+":"+mm+":"+ss;
	}
	obj.price = obj.price.split('.').join("").split(" ")[0];
	obj.abv   = obj.abv.split(',').join(".");
	self.emit('parsed_item', obj);
    };
};

util.inherits(Scraper, events.EventEmitter);
module.exports = Scraper;

