// @ts-nocheck

'use strict';

var $TypeError = require('es-errors/type');

var hasOwn = require('hasown');

// var IsDataDescriptor = require('./IsDataDescriptor');
// var IsGenericDescriptor = require('./IsGenericDescriptor');
var IsAccessorDescriptor = require('./IsAccessorDescriptor');

var isPropertyDescriptor = require('../helpers/records/property-descriptor');

// https://262.ecma-international.org/6.0/#sec-completepropertydescriptor

/** @type {<T>(Desc: Partial<import('../types').Descriptor<T | undefined>>) => import('../types').CompleteDescriptor<T>} */
module.exports = function CompletePropertyDescriptor(Desc) {
	if (!isPropertyDescriptor(Desc)) {
		throw new $TypeError('Assertion failed: `Desc` must be a Property Descriptor');
	}

	/* eslint no-param-reassign: 0 */

	if (IsAccessorDescriptor(Desc)) {
		if (!hasOwn(Desc, '[[Get]]')) {
			// @ts-expect-error all objects can get any property added, TS.
			Desc['[[Get]]'] = void 0;
		}
		if (!hasOwn(Desc, '[[Set]]')) {
			// @ts-expect-error all objects can get any property added, TS.
			Desc['[[Set]]'] = void 0;
		}
	} else {
		if (!hasOwn(Desc, '[[Value]]')) {
			Desc['[[Value]]'] = void 0;
		}
		if (!hasOwn(Desc, '[[Writable]]')) {
			Desc['[[Writable]]'] = false;
		}
	}

	if (!hasOwn(Desc, '[[Enumerable]]')) {
		Desc['[[Enumerable]]'] = false;
	}
	if (!hasOwn(Desc, '[[Configurable]]')) {
		Desc['[[Configurable]]'] = false;
	}

	// @ts-expect-error FIXME the type should be correct here
	return Desc;
};
