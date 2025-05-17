'use strict';

var esV = require('../helpers/v');

module.exports = function (t, year, Day) {
	t.ok(year >= 5, 'ES5+');

	var time = Date.UTC(2019, 8, 10, 2, 3, 4, 5);
	var add = 2.5;
	var later = new Date(time + (add * esV.msPerDay));

	t.equal(Day(later.getTime()), Day(time) + Math.floor(add), 'adding 2.5 days worth of ms, gives a Day delta of 2');
};
