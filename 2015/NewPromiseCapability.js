'use strict';

var $TypeError = require('es-errors/type');

var IsCallable = require('./IsCallable');
var IsConstructor = require('./IsConstructor');

// https://262.ecma-international.org/6.0/#sec-newpromisecapability

/** @type {<T>(C: import('../types').PromiseConstructorLike<T>) => import('../types').PromiseCapabilityRecord<T>} */
module.exports = function NewPromiseCapability(C) {
	if (!IsConstructor(C)) {
		throw new $TypeError('C must be a constructor'); // step 1
	}

	/** @typedef {import('../types').PromiseType<InstanceType<typeof C>>} T */
	/** @type {import('../types').PromiseCapabilityRecord<T>} */
	var promiseCapability = { // step 3
		__proto__: null,
		// @ts-expect-error tsdoc doesn't have `satisfies` yet
		'[[Promise]]': void undefined,
		// @ts-expect-error tsdoc doesn't have `satisfies` yet
		'[[Resolve]]': void undefined,
		// @ts-expect-error tsdoc doesn't have `satisfies` yet
		'[[Reject]]': void undefined
	};

	var promise = new C(function (resolve, reject) { // steps 4-5
		if (typeof promiseCapability['[[Resolve]]'] !== 'undefined' || typeof promiseCapability['[[Reject]]'] !== 'undefined') {
			throw new $TypeError('executor has already been called'); // step 4.a, 4.b
		}
		promiseCapability['[[Resolve]]'] = resolve; // step 4.c
		promiseCapability['[[Reject]]'] = reject; // step 4.d
	}); // step 4-6

	if (!IsCallable(promiseCapability['[[Resolve]]']) || !IsCallable(promiseCapability['[[Reject]]'])) {
		throw new $TypeError('executor must provide valid resolve and reject functions'); // steps 7-8
	}

	promiseCapability['[[Promise]]'] = promise; // step 10

	return promiseCapability; // step 11
};
