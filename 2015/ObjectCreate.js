'use strict';

var GetIntrinsic = require('get-intrinsic');

var $ObjectCreate = GetIntrinsic('%Object.create%', true);
var $TypeError = require('es-errors/type');
var $SyntaxError = require('es-errors/syntax');
var isObject = require('es-object-atoms/isObject');

var IsArray = require('./IsArray');

var forEach = require('../helpers/forEach');

var SLOT = require('internal-slot');

var hasProto = require('has-proto')();

// https://262.ecma-international.org/6.0/#sec-objectcreate

/** @type {<P extends null | object = null | object>(proto: P, internalSlotsList?: string[]) => { __proto__: P }} */
module.exports = function ObjectCreate(proto, internalSlotsList) {
	if (proto !== null && !isObject(proto)) {
		throw new $TypeError('Assertion failed: `proto` must be null or an object');
	}
	var slots = arguments.length < 2 ? [] : internalSlotsList; // step 1
	if (/* arguments.length >= 2 && */ !IsArray(slots)) {
		throw new $TypeError('Assertion failed: `internalSlotsList` must be an Array');
	}

	/** @type {{ __proto__: typeof proto }} */
	var O;
	if (hasProto) {
		O = { __proto__: proto };
	} else if ($ObjectCreate) {
		O = $ObjectCreate(proto);
	} else {
		if (proto === null) {
			throw new $SyntaxError('native Object.create support is required to create null objects');
		}
		/** @constructor */
		var T = function T() {};
		T.prototype = proto;
		// eslint-disable-next-line no-extra-parens
		O = /** @type {typeof T & { __proto__: typeof proto }} */ (new T());
	}

	if (slots.length > 0) {
		forEach(slots, function (slot) {
			SLOT.set(O, slot, void undefined);
		});
	}

	return O; // step 6
};
