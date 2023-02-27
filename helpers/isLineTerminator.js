'use strict';

// https://262.ecma-international.org/5.1/#sec-7.3

/** @type {(c: string) => boolean} */
module.exports = function isLineTerminator(c) {
	return c === '\n' || c === '\r' || c === '\u2028' || c === '\u2029';
};
