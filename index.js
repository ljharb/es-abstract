'use strict';

var has = Object.prototype.hasOwnProperty;

var assign = function (target, source) {
	for (var key in source) {
		if (has.call(source, key)) {
			target[key] = source[key];
		}
	}
	return target;
};

var ES5 = require('./es5');
var ES6 = require('./es6');

var ES = {
	ES5: ES5,
	ES6: ES6
};
assign(ES, ES5);
delete ES.CheckObjectCoercible; // renamed in ES6 to RequireObjectCoercible
assign(ES, ES6);

module.exports = ES;
