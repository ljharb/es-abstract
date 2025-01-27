'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var Enum = require('../../helpers/enum');

module.exports = function (t, year, NumberBitwiseOp) {
	t.ok(year >= 2020, 'ES2020+');

	t['throws'](
		function () { NumberBitwiseOp('invalid', 0, 0); },
		TypeError,
		'throws with an invalid op'
	);

	forEach(v.nonNumbers, function (nonNumber) {
		forEach(['&', Enum('&')], function (amp) {
			t['throws'](
				function () { NumberBitwiseOp(amp, nonNumber, 0); },
				TypeError,
				'x: ' + debug(nonNumber) + ' is not a Number'
			);
			t['throws'](
				function () { NumberBitwiseOp(amp, 0, nonNumber); },
				TypeError,
				'y: ' + debug(nonNumber) + ' is not a Number'
			);
		});
	});

	forEach(['&', Enum('&')], function (amp) {
		t.equal(NumberBitwiseOp(amp, 1, 2), 1 & 2);
	});
	forEach(['|', Enum('|')], function (pipe) {
		t.equal(NumberBitwiseOp(pipe, 1, 2), 1 | 2);
	});
	forEach(['^', Enum('^')], function (caret) {
		t.equal(NumberBitwiseOp(caret, 1, 2), 1 ^ 2);
	});
};
