'use strict';

module.exports = function (t, year, msFromTime) {
	t.ok(year >= 5, 'ES5+');

	var now = new Date();
	t.equal(msFromTime(now.getTime()), now.getUTCMilliseconds(), 'ms from Date timestamp matches getUTCMilliseconds');
};
