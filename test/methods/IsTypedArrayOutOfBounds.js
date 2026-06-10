'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');

var specEnum = require('../../helpers/specEnum');

var esV = require('../helpers/v');

module.exports = function (t, year, IsTypedArrayOutOfBounds, extras) {
	t.ok(year >= 2024, 'ES2024+');

	var order = specEnum(year, 'unordered');

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

		var preDetachedRecord = MakeTypedArrayWithBufferWitnessRecord(ta, order);

		st.equal(IsTypedArrayOutOfBounds(preDetachedRecord), false);

		DetachArrayBuffer(ab);

		var postDetachedRecord = MakeTypedArrayWithBufferWitnessRecord(ta, order);

		st['throws'](
			function () { IsTypedArrayOutOfBounds(preDetachedRecord); },
			TypeError
		);

		st.equal(IsTypedArrayOutOfBounds(postDetachedRecord), true);

		st.end();
	});

	t.test('out-of-bounds returns true', function (st) {
		var ta = new Uint8Array(8); // offset 0, length 8
		var shrunkRecord = {
			'[[Object]]': ta,
			'[[CachedBufferByteLength]]': 4 // less than TA's actual byteOffsetEnd
		};
		st.equal(
			IsTypedArrayOutOfBounds(shrunkRecord),
			true,
			'TA byteOffsetEnd > cached bufferByteLength is out-of-bounds'
		);
		st.end();
	});
};
