'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var esV = require('../helpers/v');

module.exports = function (t, year, TimeZoneString) {
	t.ok(year >= 2018, 'ES2018+');

	if (year < 2023) {
		forEach([].concat(
			v.nonNumbers,
			NaN
		), function (nonIntegerNumber) {
			t['throws'](
				function () { TimeZoneString(nonIntegerNumber); },
				TypeError,
				debug(nonIntegerNumber) + ' is not a non-NaN Number'
			);
		});
	} else {
		forEach([].concat(
			v.nonIntegerNumbers,
			esV.nonFiniteNumbers
		), function (nonIntegerNumber) {
			t['throws'](
				function () { TimeZoneString(nonIntegerNumber); },
				TypeError,
				debug(nonIntegerNumber) + ' is not an integral number'
			);
		});
	}

	var d = new Date();

	t.equal(TimeZoneString(Number(d)), d.toTimeString().match(/\((.*)\)$/)[1], 'matches parenthesized part of .toTimeString');
};
