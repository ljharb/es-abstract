'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

module.exports = function (t, year, IsExtensible) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(v.objects, function (object) {
		t.equal(IsExtensible(object), true, debug(object) + ' object is extensible');
	});
	forEach(v.primitives, function (primitive) {
		t.equal(IsExtensible(primitive), false, debug(primitive) + ' is not extensible');
	});
	if (Object.preventExtensions) {
		t.equal(IsExtensible(Object.preventExtensions({})), false, 'object with extensions prevented is not extensible');
	}
};
