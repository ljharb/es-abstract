'use strict';

var availableTypedArrays = require('available-typed-arrays')();

module.exports = function getTypedArrays(year) {
	var result = [];

	for (var i = 0; i < availableTypedArrays.length; i += 1) {
		var typedArray = availableTypedArrays[i];
		if (
			(year > 2024 || typedArray !== 'Float16Array')
            && (year >= 2020 || (typedArray !== 'BigInt64Array' && typedArray !== 'BigUint64Array'))
		) {
			result[result.length] = typedArray;
		}
	}

	return result;
};
