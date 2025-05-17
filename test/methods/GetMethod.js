'use strict';

var forEach = require('for-each');
var v = require('es-value-fixtures');
var debug = require('object-inspect');

module.exports = function (t, year, GetMethod) {
	t.ok(year >= 2015, 'ES2015+');

	forEach(v.nonPropertyKeys, function (nonPropertyKey) {
		t['throws'](
			function () { return GetMethod({}, nonPropertyKey); },
			TypeError,
			debug(nonPropertyKey) + ' is not a Property Key'
		);
	});

	t['throws'](function () { return GetMethod({ 7: 7 }, 7); }, TypeError, 'Throws a TypeError if `P` is not a property key');

	t.equal(GetMethod({}, 'a'), undefined, 'returns undefined in property is undefined');
	t.equal(GetMethod({ a: null }, 'a'), undefined, 'returns undefined if property is null');
	t.equal(GetMethod({ a: undefined }, 'a'), undefined, 'returns undefined if property is undefined');

	var obj = { a: function () {} };
	t['throws'](function () { GetMethod({ a: 'b' }, 'a'); }, TypeError, 'throws TypeError if property exists and is not callable');

	t.equal(GetMethod(obj, 'a'), obj.a, 'returns property if it is callable');
};
