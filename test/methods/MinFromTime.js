'use strict';

module.exports = function (t, year, MinFromTime) {
	t.ok(year >= 5, 'ES5+');

	var now = new Date();
	t.equal(MinFromTime(now.getTime()), now.getUTCMinutes(), 'minute from Date timestamp matches getUTCMinutes');
};
