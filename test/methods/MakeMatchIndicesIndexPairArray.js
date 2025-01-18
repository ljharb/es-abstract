'use strict';

var assign = require('object.assign');
var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');
var $setProto = require('set-proto');

/** @type {import('../testHelpers').MethodTest<'MakeMatchIndicesIndexPairArray'>} */
module.exports = function (t, year, MakeMatchIndicesIndexPairArray) {
	t.ok(year >= 2022, 'ES2022+');

	forEach(v.nonStrings, function (notString) {
		t['throws'](
			// @ts-expect-error
			function () { return MakeMatchIndicesIndexPairArray(notString); },
			TypeError,
			'`S`: ' + debug(notString) + ' is not a string'
		);
	});

	forEach(v.nonArrays, function (nonArray) {
		t['throws'](
			// @ts-expect-error
			function () { return MakeMatchIndicesIndexPairArray('', nonArray); },
			TypeError,
			'`indices`: ' + debug(nonArray) + ' is not a List'
		);

		t['throws'](
			// @ts-expect-error
			function () { return MakeMatchIndicesIndexPairArray('', [undefined], nonArray); },
			TypeError,
			'`groupNames`: ' + debug(nonArray) + ' is not a List'
		);
	});

	forEach(v.nonBooleans, function (nonBoolean) {
		t['throws'](
			// @ts-expect-error
			function () { MakeMatchIndicesIndexPairArray('', [undefined], [], nonBoolean); },
			TypeError,
			'`hasGroups`: ' + debug(nonBoolean) + ' is not a Boolean'
		);
	});

	t['throws'](
		function () { MakeMatchIndicesIndexPairArray('', [undefined], [undefined], true); },
		TypeError,
		'`indices` must contain exactly one more item than `groupNames`'
	);

	t.deepEqual(
		MakeMatchIndicesIndexPairArray(
			'abc',
			[undefined, { '[[StartIndex]]': 0, '[[EndIndex]]': 1 }, { '[[StartIndex]]': 1, '[[EndIndex]]': 3 }],
			[undefined, undefined],
			false
		),
		assign([undefined, [0, 1], [1, 3]], { groups: undefined }),
		'no groups'
	);

	t.test('has groups', { skip: !Object.create && !$setProto }, function (st) {
		var result = MakeMatchIndicesIndexPairArray(
			'abc',
			[undefined, { '[[StartIndex]]': 0, '[[EndIndex]]': 1 }, { '[[StartIndex]]': 1, '[[EndIndex]]': 3 }],
			['G1', 'G2'],
			true
		);

		st.equal('toString' in {}, true, 'normal objects have toString');
		st.equal('toString' in result.groups, false, 'makes a null `groups` object');

		st.deepEqual(
			result,
			assign(
				[undefined, [0, 1], [1, 3]],
				{ groups: $setProto({ G1: [0, 1], G2: [1, 3] }, null) }
			),
			'has groups, no group names'
		);

		st.end();
	});

	t.test('has groups when no native Object.create', { skip: !!Object.create || !!$setProto }, function (st) {
		st['throws'](
			function () { MakeMatchIndicesIndexPairArray('', [], [], false); },
			SyntaxError,
			'without a native Object.create, can not create null objects'
		);

		st.end();
	});

	t['throws'](
		function () { MakeMatchIndicesIndexPairArray('', [undefined, undefined], [''], false); },
		TypeError,
		'when `!hasGroups`, `groupNames` may only contain `undefined`'
	);
};
