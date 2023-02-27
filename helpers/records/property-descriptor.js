'use strict';

var $TypeError = require('es-errors/type');

var hasOwn = require('hasown');

var allowed = /** @type {const} */ ({
	__proto__: null,
	'[[Configurable]]': true,
	'[[Enumerable]]': true,
	'[[Get]]': true,
	'[[Set]]': true,
	'[[Value]]': true,
	'[[Writable]]': true
});

// https://262.ecma-international.org/6.0/#sec-property-descriptor-specification-type

/** @type {<T>(Desc: unknown) => Desc is import('../../types').Descriptor<T>} */
module.exports = function isPropertyDescriptor(Desc) {
	if (!Desc || typeof Desc !== 'object') {
		return false;
	}

	for (var key in Desc) { // eslint-disable-line no-restricted-syntax

		if (hasOwn(Desc, key) && !allowed[/** @type {Exclude<keyof typeof allowed, '__proto__'>} */ (key)]) {
			return false;
		}
	}

	var isData = hasOwn(Desc, '[[Value]]') || hasOwn(Desc, '[[Writable]]');
	var IsAccessor = hasOwn(Desc, '[[Get]]') || hasOwn(Desc, '[[Set]]');
	if (isData && IsAccessor) {
		throw new $TypeError('Property Descriptors may not be both accessor and data descriptors');
	}
	return true;
};
