'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');
var v = require('es-value-fixtures');

var esV = require('../helpers/v');

/** @type {import('../testHelpers').MethodTest<'TimeClip'>} */
module.exports = function (t, year, TimeClip) {
	t.ok(year >= 5, 'ES5+');

	forEach(esV.nonFiniteNumbers, function (nonFiniteNumber) {
		t.equal(TimeClip(nonFiniteNumber), NaN, debug(nonFiniteNumber) + ' is not a finite `time`');
	});
	t.equal(TimeClip(8.64e15 + 1), NaN, '8.64e15 is the largest magnitude considered "finite"');
	t.equal(TimeClip(-8.64e15 - 1), NaN, '-8.64e15 is the largest magnitude considered "finite"');

	forEach(/** @type {number[]} */ ([].concat(
		// @ts-expect-error TS sucks with concat
		v.zeroes,
		-10,
		10,
		+new Date()
	)), function (time) {
		t.looseEqual(TimeClip(time), time, debug(time) + ' is a time of ' + debug(time));
	});
};
