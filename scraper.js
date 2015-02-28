var util   = require('util'),
    events = require('events'),
    xray   = require('x-ray'),
    pg     = require('pg'),
    async  = require('async');

var connection_string = 'pg://kvasir@localhost/mjodr';

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

	/* Create a new key in the object containing an array of {store: stockstatus} objects. */
	obj.stock_array = [];
	for ( var i = 0; i < obj.stores.length; ++i) {
		var s = obj.stores[i];
		var n = obj.store_stock[i];
		var temp_obj = {}
		temp_obj[s]  = n;
		obj.stock_array.push(temp_obj);	
	}
	self.emit('parsed_item', obj);
    };

    this.write_item_to_db = function() {

    };
    
    /* Untested */
    this.write_stock_to_db = function(obj) {
	async.each(obj.stock_array, function( store, callback ) {
	    console.log(Object.keys(store)[0]);
	    console.log(store[Object.keys(store)[0]]);
	    pg.connect(connection_string, function(err, client, done) {
		if(err) { return console.error(err); }
		client.query({
		    //TODO: upsert_stock unimplemented as of now.
		    text: "SELECT upsert_stock($1, $2, $3);",
		    values: [ 
			obj.id,
			Object.keys(store)[0],
			store[Object.keys(store)[0]]
		    ]
		}, function(err, result) {
		    callback()
		    if(err) { return console.error(err) }
		    done();
		});
		done();
	    });
	    pg.end();

	}, function (err) {
	    if (err) { console.log(err) };
	    console.log("boop");
	});
    };

    this.get_item_by_id = function(id) {

    };

};

util.inherits(Scraper, events.EventEmitter);
module.exports = Scraper;

