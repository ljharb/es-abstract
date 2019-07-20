'use strict';

module.exports = function every(array, callback) {
	for (var i = 0; i < array.length; i += 1) {
		if (!callback(array[i], i, array)) {
			return false;
		}
	}
	return true;
};
