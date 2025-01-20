'use strict';

module.exports = function (t, year, YearFromTime) {
	t.ok(year >= 5, 'ES5+');

	for (var i = 1900; i < 2100; i += 1) {
		t.equal(YearFromTime(Date.UTC(i, 0, 1)), i, 'YearFromTime matches a Date object’s year on 1/1: ' + i);
		t.equal(YearFromTime(Date.UTC(i, 10, 1)), i, 'YearFromTime matches a Date object’s year on 10/1: ' + i);
	}
};
