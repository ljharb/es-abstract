'use strict';

var forEach = require('for-each');
var debug = require('object-inspect');
var v = require('es-value-fixtures');
var gOPD = require('gopd');
var $defineProperty = require('es-define-property');

module.exports = function (t, year, SetterThatIgnoresPrototypeProperties) {
	t.ok(year >= 2025, 'ES2025+');

	forEach(v.primitives, function (primitive) {
		t['throws'](
			function () { SetterThatIgnoresPrototypeProperties(primitive, {}, 'p', 'v'); },
			TypeError,
			'thisValue: ' + debug(primitive) + ' is not an object'
		);

		t['throws'](
			function () { SetterThatIgnoresPrototypeProperties({}, primitive, 'p', 'v'); },
			TypeError,
			'home: ' + debug(primitive) + ' is not an object'
		);
	});

	forEach(v.nonPropertyKeys, function (nonPropertyKey) {
		t['throws'](
			function () { SetterThatIgnoresPrototypeProperties(null, {}, nonPropertyKey, 'v'); },
			TypeError,
			debug(nonPropertyKey) + ' is not a Property Key'
		);
	});

	var sentinel = { sentinel: true };
	t['throws'](
		function () { SetterThatIgnoresPrototypeProperties(sentinel, sentinel, 'p', 'v'); },
		TypeError,
		'throws with sameValue === home'
	);

	t.notOk('nonexistent' in sentinel, 'precondition: property does not exist');
	SetterThatIgnoresPrototypeProperties(sentinel, Object.prototype, 'nonexistent', sentinel);
	t.deepEqual(
		gOPD(sentinel, 'nonexistent'),
		{
			value: sentinel,
			writable: true,
			enumerable: true,
			configurable: true
		},
		'creates own data property'
	);

	t.ok('sentinel' in sentinel, 'precondition: property exists');
	SetterThatIgnoresPrototypeProperties(sentinel, Object.prototype, 'sentinel', sentinel);
	t.deepEqual(
		gOPD(sentinel, 'nonexistent'),
		{
			value: sentinel,
			writable: true,
			enumerable: true,
			configurable: true
		},
		'assigns to existing own property'
	);

	t.test('setters', { skip: !$defineProperty }, function (st) {
		var homeObject = {};
		var setter = st.captureFn(function (value) {}); // eslint-disable-line no-unused-vars
		$defineProperty(homeObject, 'setter', {
			configurable: true,
			enumerable: true,
			set: setter
		});

		SetterThatIgnoresPrototypeProperties(sentinel, homeObject, 'setter', sentinel);

		st.deepEqual(
			setter.calls,
			[],
			'missing own property, does not call inherited setter'
		);

		SetterThatIgnoresPrototypeProperties(homeObject, Object.prototype, 'setter', sentinel);

		st.deepEqual(
			setter.calls,
			[
				{ args: [sentinel], receiver: homeObject, returned: undefined }
			],
			'existing own property, calls own setter'
		);

		st.end();
	});
	// missing own property, throws

	// missing own property, Sets
	// existing own property, Sets
};
