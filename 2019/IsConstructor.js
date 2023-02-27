// @ts-nocheck

'use strict';

var GetIntrinsic = require('../GetIntrinsic.js');

var $construct = GetIntrinsic('%Reflect.construct%', true);

/** @type {typeof import('./DefinePropertyOrThrow') | null} */
var DefinePropertyOrThrow = require('./DefinePropertyOrThrow');
try {
	DefinePropertyOrThrow({}, '', /** @type {import('../types.js').AccessorDescriptor<void>} */ { '[[Get]]': function () {} });
} catch (e) {
	// Accessor properties aren't supported
	DefinePropertyOrThrow = null;
}

// https://262.ecma-international.org/6.0/#sec-isconstructor

if (DefinePropertyOrThrow && $construct) {
	var isConstructorMarker = {};
	var badArrayLike = { length: null };
	DefinePropertyOrThrow(badArrayLike, 'length', {
		'[[Get]]': function () {
			throw isConstructorMarker;
		},
		'[[Enumerable]]': true
	});

	/** @type {<C extends import('../types').Constructor<unknown, any>>(argument: unknown) => argument is C} */
	module.exports = function IsConstructor(argument) {
		try {
			// @ts-expect-error $construct is not undefined, but TS can't narrow in closures
			// `Reflect.construct` invokes `IsConstructor(target)` before `Get(args, 'length')`:
			$construct(
				// @ts-expect-error it's fine if this is a non-function and it throws
				argument,
				badArrayLike
			);
		} catch (err) {
			return err === isConstructorMarker;
		}
		return false; // TODO: should never reach here
	};
} else {
	/** @type {<C extends import('../types').Constructor<unknown, any>>(argument: unknown) => argument is C} */
	module.exports = function IsConstructor(argument) {
		// unfortunately there's no way to truly check this without try/catch `new argument` in old environments
		return typeof argument === 'function' && !!argument.prototype;
	};
}
