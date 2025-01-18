'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

/** @type {import('../testHelpers').MethodTest<'InstallErrorCause'>} */
module.exports = function (t, year, InstallErrorCause) {
	t.ok(year >= 2022, 'ES2022+');

	forEach(v.primitives, function (primitive) {
		t['throws'](
			// @ts-expect-error
			function () { InstallErrorCause(primitive); },
			TypeError,
			'O must be an Object; ' + debug(primitive) + ' is not one'
		);
	});

	/** @type {Record<PropertyKey, unknown>} */
	var obj = {};
	InstallErrorCause(obj);
	t.notOk(
		'cause' in obj,
		'installs nothing when `options` is omitted'
	);

	InstallErrorCause(obj, {});
	t.notOk(
		'cause' in obj,
		'installs nothing when `cause` is absent'
	);

	InstallErrorCause(obj, { cause: undefined });
	t.ok(
		'cause' in obj,
		'installs `undefined` when `cause` is present and `undefined`'
	);
	t.equal(obj.cause, undefined, 'obj.cause is `undefined`');

	/** @type {Record<PropertyKey, unknown>} */
	var obj2 = {};
	InstallErrorCause(obj2, { cause: obj });
	t.ok(
		'cause' in obj2,
		'installs when `cause` is present'
	);
	t.equal(obj2.cause, obj, 'obj2.cause is as expected');
};
