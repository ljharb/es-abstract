'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

module.exports = function (t, year, InstallErrorCause) {
	t.ok(year >= 2022, 'ES2022+');

	forEach(v.primitives, function (primitive) {
		t['throws'](
			function () { InstallErrorCause(primitive); },
			TypeError,
			'O must be an Object; ' + debug(primitive) + ' is not one'
		);
	});

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

	var obj2 = {};
	InstallErrorCause(obj2, { cause: obj });
	t.ok(
		'cause' in obj2,
		'installs when `cause` is present'
	);
	t.equal(obj2.cause, obj, 'obj2.cause is as expected');
};
