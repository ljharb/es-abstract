'use strict';

var CompletionRecord = require('./CompletionRecord');

// https://262.ecma-international.org/9.0/#sec-throwcompletion

/** @type {<T>(argument: T) => CompletionRecord<'throw', T>} */
module.exports = function ThrowCompletion(argument) {
	return new CompletionRecord('throw', argument);
};
