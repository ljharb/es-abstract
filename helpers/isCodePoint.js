'use strict';

/** @type {(cp: unknown) => cp is import('../types').nonNegativeInteger} */
module.exports = function isCodePoint(cp) {
	return typeof cp === 'number' && cp >= 0 && cp <= 0x10FFFF && (cp | 0) === cp;
};
