'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');
var v = require('es-value-fixtures');
var esV = require('../helpers/v');

module.exports = function (t, year, SetDataSize) {
	t.ok(year >= 2025, 'ES2025+');

	forEach(v.nonArrays, function (nonArray) {
		t['throws'](
			function () { SetDataSize(nonArray, 'value'); },
			TypeError,
			debug(nonArray) + ' is not an Array'
		);
	});

	t.equal(
		SetDataSize('EMPTY'),
		0,
		'~EMPTY~ works'
	);

	t.equal(
		// eslint-disable-next-line no-sparse-arrays
		SetDataSize([null, +0, false, -0, , NaN].concat(esV.unknowns)),
		5 + esV.unknowns.length,
		'SetData size is correctly calculated'
	);
};
