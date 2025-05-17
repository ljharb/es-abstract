'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

module.exports = function (t, year, Invoke) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(v.nonPropertyKeys, function (nonKey) {
		t['throws'](
			function () { Invoke({}, nonKey); },
			TypeError,
			debug(nonKey) + ' is not a Property Key'
		);
	});

	t['throws'](
		function () { Invoke({ o: false }, 'o'); },
		TypeError,
		'fails on a non-function'
	);

	forEach(v.nonArrays, function (nonArray) {
		t['throws'](
			function () { Invoke({}, '', nonArray); },
			TypeError,
			debug(nonArray) + ' is not an Array'
		);
	});

	t.test('invoked callback', function (st) {
		var aValue = {};
		var bValue = {};
		var obj = {
			f: function (a) {
				st.equal(arguments.length, 2, '2 args passed');
				st.equal(a, aValue, 'first arg is correct');
				st.equal(arguments[1], bValue, 'second arg is correct');
			}
		};
		st.plan(3);
		Invoke(obj, 'f', [aValue, bValue]);
	});
};
