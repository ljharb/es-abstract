'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');
var SLOT = require('internal-slot');
var $setProto = require('set-proto');

module.exports = function (t, year, OrdinaryObjectCreate) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(v.nonNullPrimitives, function (value) {
		t['throws'](
			function () { OrdinaryObjectCreate(value); },
			TypeError,
			debug(value) + ' is not null, or an object'
		);
	});

	forEach(v.nonArrays, function (nonArray) {
		t['throws'](
			function () { OrdinaryObjectCreate({}, nonArray); },
			TypeError,
			debug(nonArray) + ' is not an Array'
		);
	});

	t.test('proto arg', function (st) {
		var Parent = function Parent() {};
		Parent.prototype.foo = {};
		var child = OrdinaryObjectCreate(Parent.prototype);
		st.equal(child instanceof Parent, true, 'child is instanceof Parent');
		st.equal(child.foo, Parent.prototype.foo, 'child inherits properties from Parent.prototype');

		st.end();
	});

	t.test('internal slots arg', function (st) {
		st.doesNotThrow(function () { OrdinaryObjectCreate({}, []); }, 'an empty slot list is valid');

		var O = OrdinaryObjectCreate({}, ['a', 'b']);
		st.doesNotThrow(
			function () {
				SLOT.assert(O, 'a');
				SLOT.assert(O, 'b');
			},
			'expected internal slots exist'
		);
		st['throws'](
			function () { SLOT.assert(O, 'c'); },
			TypeError,
			'internal slots that should not exist throw'
		);

		st.end();
	});

	t.test('null proto', { skip: !Object.create && !$setProto }, function (st) {
		st.equal('toString' in {}, true, 'normal objects have toString');
		st.equal('toString' in OrdinaryObjectCreate(null), false, 'makes a null object');

		st.end();
	});

	t.test('null proto when no native Object.create', { skip: Object.create || $setProto }, function (st) {
		st['throws'](
			function () { OrdinaryObjectCreate(null); },
			SyntaxError,
			'without a native Object.create or __proto__ support, can not create null objects'
		);

		st.end();
	});
};
