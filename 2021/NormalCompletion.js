// @ts-nocheck

'use strict';

var CompletionRecord = require('./CompletionRecord');

// https://262.ecma-international.org/6.0/#sec-normalcompletion

/** @type {<T>(value: T) => CompletionRecord<'normal', T>} */
module.exports = function NormalCompletion(value) {
	return new CompletionRecord('normal', value);
};
