'use strict';

const diff = require('diff');

const years = require('./years');

/** @type {[string, string[]][]} */
// @ts-expect-error TS sucks with concat
// eslint-disable-next-line no-extra-parens
const keys = /** @type {string[]} */ (['../es5'].concat(years)).map(/** @param {string} x */ (x) => [
	x,
	Object.keys(require(`./${x}`)).sort(), // eslint-disable-line global-require
]);

const results = Object.fromEntries([5].concat(years).map((y) => [
	y,
	{ added: new Set(), removed: new Set() },
]));

/** @type {(from: string[], to: string[], result: { added: Set<string>, removed: Set<string> }) => void} */
function parse(from, to, result) {
	diff.diffArrays(from, to).forEach((x) => {
		x.value.forEach((v) => {
			if (x.added) {
				result.added.add(v);
			}
			if (x.removed) {
				result.removed.add(v.replace(/ /g, ''));
			}
		});
	});
}

keys.reduce(([, pK], [y, k]) => {
	parse(pK, k, results[y]);
	return [y, k];
});

module.exports = results;
