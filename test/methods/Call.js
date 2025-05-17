'use strict';

var debug = require('object-inspect');
var forEach = require('for-each');
var v = require('es-value-fixtures');

var defineProperty = require('../helpers/defineProperty');

module.exports = function (t, year, Call) {
	t.ok(year >= 5, 'ES5+');

	var receiver = {};
	var notFuncs = [].concat(
		v.nonFunctions,
		/a/g,
		new RegExp('a', 'g')
	);

	forEach(notFuncs, function (notFunc) {
		t['throws'](
			function () { return Call(notFunc, receiver); },
			TypeError,
			debug(notFunc) + ' (' + typeof notFunc + ') is not callable'
		);
	});

	forEach(v.nonArrays, function (nonArray) {
		t['throws'](
			function () { Call(Function.prototype, null, nonArray); },
			TypeError,
			debug(nonArray) + ' is not an array'
		);
	});

	Call(
		function (a, b) {
			t.equal(this, receiver, 'context matches expected');
			t.deepEqual([a, b], [1, 2], 'named args are correct');
			t.equal(arguments.length, 3, 'extra argument was passed');
			t.equal(arguments[2], 3, 'extra argument was correct');
		},
		receiver,
		[1, 2, 3]
	);

	t.test('Call doesn’t use func.apply', function (st) {
		st.plan(4);

		var bad = function (a, b) {
			st.equal(this, receiver, 'context matches expected');
			st.deepEqual([a, b], [1, 2], 'named args are correct');
			st.equal(arguments.length, 3, 'extra argument was passed');
			st.equal(arguments[2], 3, 'extra argument was correct');
		};

		defineProperty(bad, 'apply', {
			enumerable: true,
			configurable: true,
			value: function () {
				st.fail('bad.apply shouldn’t get called');
			},
			writable: true
		});

		Call(bad, receiver, [1, 2, 3]);
		st.end();
	});
};
