'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');

var esV = require('../helpers/v');
var getTypedArrays = require('../helpers/typedArrays');

module.exports = function (t, year, actual, extras) {
	t.ok(year >= 2015, 'ES2015+');

	var order = 'UNORDERED';

	var ValidateTypedArray = year >= 2024 ? actual : function ValidateTypedArray(typedArray) {
		return actual(typedArray);
	};

	var DetachArrayBuffer = extras.getAO('DetachArrayBuffer');

	forEach([].concat(
		esV.unknowns,
		[[]]
	), function (nonTA) {
		t['throws'](
			function () { ValidateTypedArray(nonTA, order); },
			TypeError,
			debug(nonTA) + ' is not a TypedArray'
		);
	});

	var availableTypedArrays = getTypedArrays(year);

	t.test('actual typed arrays', { skip: availableTypedArrays.length === 0 }, function (st) {
		forEach(availableTypedArrays, function (TypedArray) {
			var ta = new global[TypedArray](0);
			st.doesNotThrow(
				function () { ValidateTypedArray(ta, order); },
				debug(ta) + ' is a TypedArray'
			);

			st.test('can detach', { skip: !esV.canDetach }, function (s2t) {
				DetachArrayBuffer(ta.buffer);

				s2t['throws'](
					function () { ValidateTypedArray(ta, order); },
					TypeError,
					debug(ta) + ' is a detached TypedArray'
				);

				s2t.end();
			});

			if (year >= 2024) {
				// TODO: test that throws when order is invalid or missing
			}
		});

		st.end();
	});
};
