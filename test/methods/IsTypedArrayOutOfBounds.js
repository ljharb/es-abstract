'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');

var esV = require('../helpers/v');

module.exports = function (t, year, IsTypedArrayOutOfBounds, extras) {
	t.ok(year >= 2024, 'ES2024+');

	var DetachArrayBuffer = extras.getAO('DetachArrayBuffer');
	var MakeTypedArrayWithBufferWitnessRecord = extras.getAO('MakeTypedArrayWithBufferWitnessRecord');

	forEach([].concat(
		esV.unknowns,
		[[]]
	), function (nonTAWBWR) {
		t['throws'](
			function () { IsTypedArrayOutOfBounds(nonTAWBWR); },
			TypeError,
			debug(nonTAWBWR) + ' is not a Typed Array With Buffer Witness Record'
		);
	});

	t.test('detached buffer', { skip: !esV.canDetach }, function (st) {
		var ab = new ArrayBuffer(8);

		var ta = new Uint8Array(ab);

		var preDetachedRecord = MakeTypedArrayWithBufferWitnessRecord(ta, 'UNORDERED');

		st.equal(IsTypedArrayOutOfBounds(preDetachedRecord), false);

		DetachArrayBuffer(ab);

		var postDetachedRecord = MakeTypedArrayWithBufferWitnessRecord(ta, 'UNORDERED');

		st['throws'](
			function () { IsTypedArrayOutOfBounds(preDetachedRecord); },
			TypeError
		);

		st.equal(IsTypedArrayOutOfBounds(postDetachedRecord), true);

		st.end();
	});
};
