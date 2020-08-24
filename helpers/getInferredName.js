'use strict';

var getInferredName;
try {
	// eslint-disable-next-line no-new-func
	getInferredName = Function('s', 'return { [s]() {} }[s].name;');
} catch (e) {}

// eslint-disable-next-line no-new-func
var inferred = Function('var inferred = function () {}; return inferred;')();

module.exports = getInferredName && inferred.name === 'inferred' ? getInferredName : null;
