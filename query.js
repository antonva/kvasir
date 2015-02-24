var pg = require('pg')

pg.connect('pg://kvasir@localhost/mjodr', function(err, client, done) {
	if(err) {
		return console.error(err);
	}
	client.query({
		text: "SELECT id, name, volume, abv, price FROM item WHERE stock_updated IS NOT NULL AND abv > 12;"
	}, function(err, result) {
		if(err) {
			return console.error(err)
		}
		var arr = l2ml(result.rows);
		bang4buck(arr);
		done();
	});
	done();
});
pg.end();

function l2ml(rows) {
	l = []
	for(var i = 0; i < rows.length; ++i) {
		var L = rows[i].volume.indexOf('L');
		if ( L >= 0) {
			rows[i].volume = parseFloat(rows[i].volume.slice(0,L))*1000;
			if(rows[i].volume > 0) {l.push(rows[i]); }
		} else {
			var ml = rows[i].volume.indexOf('ml');
			rows[i].volume = parseFloat(rows[i].volume.slice(0,ml));
			if(rows[i].volume > 0) {l.push(rows[i]); }
		}
	}
	return l
};

function bang4buck(rows) {
	for(var i = 0; i < rows.length; ++i) {
		rows[i]['bang'] = rows[i].abv/(rows[i].price/rows[i].volume);
	}
	rows.sort(function(a,b) { return parseFloat(a.bang) - parseFloat(b.bang) });	
	console.log(rows);
};
