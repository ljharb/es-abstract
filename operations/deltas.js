'use strict';

const diff = require('diff');

const years = require('./years');

const keys = ['../es5'].concat(years).map((x) => [
	x,
	Object.keys(require(`./${x}`)).sort(), // eslint-disable-line global-require
]);

const results = Object.fromEntries([5].concat(years).map((y) => [
	y,
	{ added: new Set(), removed: new Set() },
]));

function parse(from, to, result) {
	diff.diffArrays(from, to).forEach((x) => {
		x.value.forEach((v) => {
			if (x.added) {
				result.added.add(v);
			}
			if (x.removed) {
				result.removed.add(v);
			}
		});
	});
}

keys.reduce(([, pK], [y, k]) => {
	parse(pK, k, results[y]);
	return [y, k];
});

module.exports = results;
