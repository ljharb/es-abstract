'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

module.exports = function (t, year, NumberUnsignedRightShift) {
	t.ok(year >= 2020, 'ES2020+');

	forEach(v.nonNumbers, function (nonNumber) {
		t['throws'](
			function () { NumberUnsignedRightShift(nonNumber, 0); },
			TypeError,
			'x: ' + debug(nonNumber) + ' is not a Number'
		);
		t['throws'](
			function () { NumberUnsignedRightShift(0, nonNumber); },
			TypeError,
			'y: ' + debug(nonNumber) + ' is not a Number'
		);
	});

	forEach([].concat(
		0,
		v.int32s
	), function (int32) {
		forEach([1, 3, 5, 31, 32, 33], function (bits) {
			t.equal(NumberUnsignedRightShift(int32, bits), int32 >>> bits, debug(int32) + ' >>> ' + bits + ' is ' + debug(int32 >>> bits));
		});
	});
};
