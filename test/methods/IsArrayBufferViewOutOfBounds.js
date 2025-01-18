'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');

var esV = require('../helpers/v');
var getTypedArrays = require('../helpers/typedArrays');

/** @type {import('../testHelpers').MethodTest<'IsArrayBufferViewOutOfBounds'>} */
module.exports = function (t, year, IsArrayBufferViewOutOfBounds, extras) {
	t.ok(year >= 2024, 'ES2024+');

	var DetachArrayBuffer = extras.getAO('DetachArrayBuffer');

	forEach(esV.unknowns, function (nonABV) {
		t['throws'](
			// @ts-expect-error
			function () { IsArrayBufferViewOutOfBounds(nonABV); },
			TypeError,
			debug(nonABV) + ' is not a Typed Array or DataView'
		);
	});

	var availableTypedArrays = getTypedArrays(year);

	t.test('Typed Arrays supported', { skip: availableTypedArrays.length === 0 }, function (st) {
		var ab = new ArrayBuffer(8);
		var dv = new DataView(ab);

		st.equal(IsArrayBufferViewOutOfBounds(dv), false, 'DataView is not out of bounds');

		forEach(availableTypedArrays, function (type) {
			var TA = global[type];
			var ta = new TA(ab);

			st.equal(IsArrayBufferViewOutOfBounds(ta), false, debug(ta) + ' is not out of bounds');
		});

		st.test('can detach', { skip: !esV.canDetach }, function (s2t) {
			DetachArrayBuffer(ab);

			s2t.equal(IsArrayBufferViewOutOfBounds(dv), true, 'DataView with detached buffer is out of bounds');

			forEach(getTypedArrays(year), function (type) {
				var ab2 = new ArrayBuffer(8);
				var TA = global[type];
				var ta = new TA(ab2);
				DetachArrayBuffer(ab2);

				s2t.equal(IsArrayBufferViewOutOfBounds(ta), true, debug(ta) + ' with detached buffer is out of bounds');
			});

			s2t.end();
		});

		st.end();
	});
};
