// @ts-nocheck

'use strict';

var SLOT = require('internal-slot');
/** @type {object[]} */
var keptObjects = [];

// https://262.ecma-international.org/12.0/#sec-clear-kept-objects

module.exports = function ClearKeptObjects() {
	keptObjects.length = 0;
};

SLOT.set(module.exports, '[[es-abstract internal: KeptAlive]]', keptObjects);
