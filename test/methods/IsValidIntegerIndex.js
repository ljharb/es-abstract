'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var getTypedArrays = require('../helpers/typedArrays');
var esV = require('../helpers/v');

module.exports = function (t, year, IsValidIntegerIndex) {
	t.ok(year >= 2020, 'ES2020+');

	forEach([].concat(
		esV.unknowns,
		[[]]
	), function (nonTA) {
		t['throws'](
			function () { IsValidIntegerIndex(nonTA, 0); },
			TypeError,
			debug(nonTA) + ' is not a TypedArray'
		);
	});

	var availableTypedArrays = getTypedArrays(year);
	t.test('Typed Array support', { skip: availableTypedArrays.length === 0 }, function (st) {
		forEach(availableTypedArrays, function (typedArray) {
			st.test(typedArray, function (s2t) {
				var TA = global[typedArray];
				var ta = new TA(1);

				forEach(v.nonNumbers, function (nonNumber) {
					s2t['throws'](
						function () { IsValidIntegerIndex(ta, nonNumber); },
						TypeError,
						'index: ' + debug(nonNumber) + ' is not a Number'
					);
				});

				forEach(v.nonIntegerNumbers, function (nonInteger) {
					s2t.equal(IsValidIntegerIndex(ta, nonInteger), false, debug(nonInteger) + ' is not an integer');
				});

				s2t.equal(IsValidIntegerIndex(ta, -0), false, '-0 is not a valid index');
				s2t.equal(IsValidIntegerIndex(ta, -1), false, '-1 is not a valid index');
				for (var i = 0; i < ta.length; i += 1) {
					s2t.equal(IsValidIntegerIndex(ta, i), true, i + ' is a valid index of an array of length ' + ta.length);
				}
				s2t.equal(IsValidIntegerIndex(ta, ta.length), false, ta.length + ' is not a valid index of an array of length ' + ta.length);

				s2t.end();
			});
		});

		st.end();
	});
};
