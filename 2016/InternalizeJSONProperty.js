// @ts-nocheck

'use strict';

var $TypeError = require('es-errors/type');
var isObject = require('es-object-atoms/isObject');

var Call = require('./Call');
var CreateDataProperty = require('./CreateDataProperty');
var EnumerableOwnNames = require('./EnumerableOwnNames');
var Get = require('./Get');
var IsArray = require('./IsArray');
var ToLength = require('./ToLength');
var ToString = require('./ToString');

var forEach = require('../helpers/forEach');

// https://262.ecma-international.org/6.0/#sec-internalizejsonproperty

// note: `reviver` was implicitly closed-over until ES2020, where it becomes a third argument

/** @type {<T extends { [k: string]: unknown } | []>(holder: T, name: Exclude<keyof import('../types').ProtoResolved<T>, "__proto__">, reviver: import('../types').Func) => unknown} */
module.exports = function InternalizeJSONProperty(holder, name, reviver) {
	if (!isObject(holder)) {
		throw new $TypeError('Assertion failed: `holder` is not an Object');
	}
	if (typeof name !== 'string') {
		throw new $TypeError('Assertion failed: `name` is not a String');
	}
	if (typeof reviver !== 'function') {
		throw new $TypeError('Assertion failed: `reviver` is not a Function');
	}

	/** @type {unknown} */
	var val = Get(holder, name); // step 1

	if (isObject(val)) { // step 3
		if (IsArray(val)) { // step 3.a, 3.c
			var I = 0; // step 3.c.i

			var len = ToLength(val.length); // step 3.b.ii

			while (I < len) { // step 3.b.iv
				// eslint-disable-next-line no-extra-parens
				var newElement = InternalizeJSONProperty(/** @type {typeof holder} */ (val), /** @type {typeof name} */ (ToString(I)), reviver); // step 3.b.iv.1

				if (typeof newElement === 'undefined') { // step 3.b.iv.3
					delete val[+ToString(I)]; // step 3.b.iv.3.a
				} else { // step 3.b.iv.4
					CreateDataProperty(val, ToString(I), newElement); // step 3.b.iv.4.a
				}

				I += 1; // step 3.b.iv.6
			}
		} else {
			var keys = EnumerableOwnNames(val); // step 3.d.i

			forEach(keys, function (P) { // step 3.d.iii
				// @ts-expect-error TS can't narrow in a closure
				// eslint-disable-next-line no-shadow
				var newElement = InternalizeJSONProperty(val, P, reviver); // step 3.d.iii.1

				if (typeof newElement === 'undefined') { // step 3.d.iii.3
					// @ts-expect-error TS can't narrow in a closure
					delete val[P]; // step 3.d.iii.3.a
				} else { // step 3.d.iii.4
					// @ts-expect-error TS can't narrow in a closure
					CreateDataProperty(val, P, newElement); // step 3.d.iii.4.a
				}
			});
		}
	}

	return Call(reviver, holder, [name, val]); // step 4
};
