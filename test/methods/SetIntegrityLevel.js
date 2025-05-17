'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

var esV = require('../helpers/v');

module.exports = function (t, year, SetIntegrityLevel) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(v.primitives, function (primitive) {
		t['throws'](
			function () { SetIntegrityLevel(primitive); },
			TypeError,
			debug(primitive) + ' is not an Object'
		);
	});

	t['throws'](
		function () { SetIntegrityLevel({}); },
		/^TypeError: Assertion failed: `level` must be `"sealed"` or `"frozen"`$/,
		'`level` must be `"sealed"` or `"frozen"`'
	);

	var O = { a: 1 };
	t.test('sealed', { skip: !Object.preventExtensions || esV.noThrowOnStrictViolation }, function (st) {
		st.equal(SetIntegrityLevel(O, 'sealed'), true);
		st['throws'](
			function () { O.b = 2; },
			/^TypeError: (Cannot|Can't) add property b, object is not extensible$/,
			'sealing prevent new properties from being added'
		);
		O.a = 2;
		st.equal(O.a, 2, 'pre-frozen, existing properties are mutable');
		st.end();
	});

	t.test('frozen', { skip: !Object.freeze || esV.noThrowOnStrictViolation }, function (st) {
		st.equal(SetIntegrityLevel(O, 'frozen'), true);
		st['throws'](
			function () { O.a = 3; },
			/^TypeError: Cannot assign to read only property 'a' of /,
			'freezing prevents existing properties from being mutated'
		);
		st.end();
	});
};
