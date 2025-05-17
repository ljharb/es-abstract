'use strict';

var esV = require('../helpers/v');

module.exports = function (t, year, WeekDay) {
	t.ok(year >= 5, 'ES5+');

	var now = new Date();
	var today = now.getUTCDay();
	for (var i = 0; i < 7; i += 1) {
		var weekDay = WeekDay(now.getTime() + (i * esV.msPerDay));
		t.equal(weekDay, (today + i) % 7, i + ' days after today (' + today + '), WeekDay is ' + weekDay);
	}
};
