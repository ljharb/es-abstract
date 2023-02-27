'use strict';

/** @type {(charCode: number) => boolean} */
module.exports = function isLeadingSurrogate(charCode) {
	return typeof charCode === 'number' && charCode >= 0xD800 && charCode <= 0xDBFF;
};
