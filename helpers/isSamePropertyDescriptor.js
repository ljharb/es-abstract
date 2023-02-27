'use strict';

var every = require('./every');

/** @type {(ES: { SameValue: (x: unknown, y: unknown) => boolean }, D1: Record<PropertyKey, unknown>, D2: Record<PropertyKey, unknown>) => boolean} */
module.exports = function isSamePropertyDescriptor(ES, D1, D2) {
	var fields = [
		'[[Configurable]]',
		'[[Enumerable]]',
		'[[Get]]',
		'[[Set]]',
		'[[Value]]',
		'[[Writable]]'
	];
	return every(fields, function (field) {
		if ((field in D1) !== (field in D2)) {
			return false;
		}
		return ES.SameValue(D1[field], D2[field]);
	});
};
