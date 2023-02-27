'use strict';

var callBound = require('call-bound');

var $TypeError = require('es-errors/type');

var $deref = /** @type {<T extends WeakKey>(thisArg: WeakRef<T>) => T | undefined} */ (callBound('WeakRef.prototype.deref', true));

var isWeakRef = require('is-weakref');

var AddToKeptObjects = require('./AddToKeptObjects');

// https://262.ecma-international.org/12.0/#sec-weakrefderef

/** @type {<T extends WeakKey>(weakRef: WeakRef<T>) => T | undefined} */
module.exports = function WeakRefDeref(weakRef) {
	if (!isWeakRef(weakRef)) {
		throw new $TypeError('Assertion failed: `weakRef` must be a WeakRef');
	}
	var target = $deref(weakRef);
	if (target) {
		AddToKeptObjects(target);
	}
	return target;
};
