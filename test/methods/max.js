'use strict';

var v = require('es-value-fixtures');

/** @type {import('../testHelpers').MethodTest<'max'>} */
module.exports = function (t, year, max) {
	t.ok(year >= 2015, 'ES2015+');

	t.equal(max.apply(null, v.numbers), Math.max.apply(null, v.numbers), 'works with numbers');
};
