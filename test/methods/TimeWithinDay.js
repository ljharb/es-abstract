'use strict';

var esV = require('../helpers/v');

module.exports = function (t, year, TimeWithinDay) {
	t.ok(year >= 5, 'ES5+');

	var time = Date.UTC(2019, 8, 10, 2, 3, 4, 5);
	var add = 2.5;
	var later = new Date(time + (add * esV.msPerDay));

	t.equal(
		TimeWithinDay(later.getTime()),
		TimeWithinDay(time) + (0.5 * esV.msPerDay),
		'adding 2.5 days worth of ms, gives a TimeWithinDay delta of +0.5'
	);
};
