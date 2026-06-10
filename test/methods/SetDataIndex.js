'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');
var v = require('es-value-fixtures');
var esV = require('../helpers/v');

var specEnum = require('../../helpers/specEnum');

module.exports = function (t, year, SetDataIndex) {
	t.ok(year >= 2025, 'ES2025+');

	var empty = specEnum(year, 'empty');
	var notFound = specEnum(year, 'not-found');

	forEach(v.nonArrays, function (nonArray) {
		t['throws'](
			function () { SetDataIndex(nonArray, 'value'); },
			TypeError,
			debug(nonArray) + ' is not an Array'
		);
	});

	t.equal(
		SetDataIndex(empty, empty),
		notFound,
		'~EMPTY~ works'
	);

	t.equal(
		SetDataIndex([null, +0, false], -0),
		1,
		'SetData with +0 finds index of -0'
	);
	t.equal(
		SetDataIndex([null, -0, false], +0),
		notFound,
		'SetData with -0 does not find the index from +0 (SetData is expected to never have -0 in it)'
	);

	t.equal(
		SetDataIndex([null, NaN, false], NaN),
		1,
		'SetData with NaN finds index of NaN'
	);

	esV.unknowns.forEach(function (unknown) {
		if (unknown !== 0) {
			t.equal(
				SetDataIndex([{}, unknown, {}], unknown),
				1,
				debug(unknown) + ' is found in the SetData at its index'
			);
		}
	});
};
