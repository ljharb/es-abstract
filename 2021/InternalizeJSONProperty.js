// @ts-nocheck

'use strict';

var $TypeError = require('es-errors/type');
var isObject = require('es-object-atoms/isObject');

var Call = require('./Call');
var CreateDataProperty = require('./CreateDataProperty');
var EnumerableOwnPropertyNames = require('./EnumerableOwnPropertyNames');
var Get = require('./Get');
var IsArray = require('./IsArray');
var LengthOfArrayLike = require('./LengthOfArrayLike');
var ToString = require('./ToString');

var forEach = require('../helpers/forEach');

// https://262.ecma-international.org/11.0/#sec-internalizejsonproperty

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

	var val = Get(holder, name); // step 1

	// if (isObject(val)) { // step 2
	if (IsArray(val)) { // step 2.a, 2.b
		var I = 0; // step 2.b.i

		var len = LengthOfArrayLike(val); // step 2.b.ii

		while (I < len) { // step 2.b.iii
			// eslint-disable-next-line no-extra-parens
			var newElement = InternalizeJSONProperty(/** @type {typeof holder} */ (val), /** @type {typeof name} */ (ToString(I)), reviver); // step 2.b.iv.1

			if (typeof newElement === 'undefined') { // step 2.b.iii.2
				delete val[+ToString(I)]; // step 2.b.iii.2.a
			} else { // step 2.b.iii.3
				CreateDataProperty(val, ToString(I), newElement); // step 2.b.iii.3.a
			}

			I += 1; // step 2.b.iii.4
		}
	} else if (isObject(val)) { // step 2.c
		// eslint-disable-next-line no-extra-parens
		var keys = EnumerableOwnPropertyNames(/** @type {Parameters<typeof EnumerableOwnPropertyNames>[0]} */ (val), 'key'); // step 2.c.i

		forEach(keys, function (P) { // step 2.c.ii
			// eslint-disable-next-line no-shadow, no-extra-parens
			var newElement = InternalizeJSONProperty(/** @type {typeof holder} */ (val), /** @type {typeof name} */ (P), reviver); // step 2.c.ii.1

			if (typeof newElement === 'undefined') { // step 2.c.ii.2
				// @ts-expect-error TODO/FIXME
				delete val[P]; // step 2.c.ii.2.a
			} else { // step 2.c.ii.3
				// eslint-disable-next-line no-extra-parens
				CreateDataProperty(/** @type {Parameters<typeof InternalizeJSONProperty>[0]} */ (val), P, newElement); // step 2.c.ii.3.a
			}
		});
	}
	// }

	return Call(reviver, holder, [name, val]); // step 3
};
