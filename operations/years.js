'use strict';

const range = function range(a, z) {
	return Array.from({ length: z + 1 - a }, (_, i) => i + a);
};

module.exports = Object.freeze(range(2015, 2021));
