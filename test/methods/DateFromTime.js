'use strict';

module.exports = function (t, year, DateFromTime) {
	t.ok(year >= 5, 'ES5+');

	var i;
	for (i = 1; i <= 28; i += 1) {
		t.equal(DateFromTime(Date.UTC(2019, 1, i)), i, '2019.02.' + i + ' is date ' + i);
	}
	for (i = 1; i <= 29; i += 1) {
		t.equal(DateFromTime(Date.UTC(2016, 1, i)), i, '2016.02.' + i + ' is date ' + i);
	}
	for (i = 1; i <= 30; i += 1) {
		t.equal(DateFromTime(Date.UTC(2019, 2, i)), i, '2019.03.' + i + ' is date ' + i);
		t.equal(DateFromTime(Date.UTC(2019, 3, i)), i, '2019.04.' + i + ' is date ' + i);
		t.equal(DateFromTime(Date.UTC(2019, 5, i)), i, '2019.06.' + i + ' is date ' + i);
		t.equal(DateFromTime(Date.UTC(2019, 7, i)), i, '2019.08.' + i + ' is date ' + i);
		t.equal(DateFromTime(Date.UTC(2019, 8, i)), i, '2019.09.' + i + ' is date ' + i);
		t.equal(DateFromTime(Date.UTC(2019, 10, i)), i, '2019.11.' + i + ' is date ' + i);
	}
	for (i = 1; i <= 31; i += 1) {
		t.equal(DateFromTime(Date.UTC(2019, 0, i)), i, '2019.01.' + i + ' is date ' + i);
		t.equal(DateFromTime(Date.UTC(2019, 4, i)), i, '2019.05.' + i + ' is date ' + i);
		t.equal(DateFromTime(Date.UTC(2019, 6, i)), i, '2019.07.' + i + ' is date ' + i);
		t.equal(DateFromTime(Date.UTC(2019, 9, i)), i, '2019.10.' + i + ' is date ' + i);
		t.equal(DateFromTime(Date.UTC(2019, 11, i)), i, '2019.12.' + i + ' is date ' + i);
	}
};
