'use strict';

/** @type {typeof Number.isNaN} */
module.exports = Number.isNaN || function isNaN(a) {
	return a !== a;
};
