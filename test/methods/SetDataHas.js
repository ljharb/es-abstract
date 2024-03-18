'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');
var v = require('es-value-fixtures');
var esV = require('../helpers/v');

module.exports = function (t, year, SetDataHas) {
	t.ok(year >= 2025, 'ES2025+');

	forEach(v.nonArrays, function (nonArray) {
		t['throws'](
			function () { SetDataHas(nonArray, 'value'); },
			TypeError,
			debug(nonArray) + ' is not an Array'
		);
	});

	t.equal(
		SetDataHas('EMPTY', 'EMPTY'),
		false,
		'~EMPTY~ works'
	);

	t.equal(
		SetDataHas([+0], -0),
		true,
		'SetData with +0 has -0'
	);
	t.equal(
		SetDataHas([-0], +0),
		false,
		'SetData with -0 does not have +0 (SetData is expected to never have -0 in it)'
	);

	t.equal(
		SetDataHas([NaN], NaN),
		true,
		'SetData with NaN has NaN'
	);

	esV.unknowns.forEach(function (unknown) {
		if (unknown !== 0) {
			t.equal(
				SetDataHas([unknown], unknown),
				true,
				debug(unknown) + ' is found in the SetData'
			);
		}
	});
};
