'use strict';

var v = require('es-value-fixtures');

module.exports = function (t, year, min) {
	t.ok(year >= 2015, 'ES2015+');

	t.equal(min.apply(null, v.numbers), Math.min.apply(null, v.numbers), 'works with numbers');
};
