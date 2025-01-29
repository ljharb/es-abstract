'use strict';

var path = require('path');
var forEach = require('for-each');
var test = require('tape');

var runManifestTest = require('./runManifestTest');
var diffOps = require('../diffOps');
/** @type {import('./aoAliases.json')} */
var aoAliases = require('./aoAliases.json');

var getAOs = require('./getAOs');

var index = require('../../');

/** @type {<Y extends import('../testHelpers').TestYear>(year: Y, expectedMissing: import('../testHelpers').AllAONames[]) => void} */
module.exports = function testYear(year, expectedMissing) {
	var methods = getAOs(year);

	var ES = index[/** @type {`ES${year}`} */ ('ES' + year)];

	/** @type {<M extends import('../testHelpers').AllAONamesForYear<typeof year>>(method: M) => import('../testHelpers').AOForYears<M, typeof year> | null} */
	var getAO = function getAO(method) {
		/** @typedef {typeof method} M */
		var parts = /** @type {import('../testHelpers').SplitAOName<M>} */ (method.split('::'));
		var obj = ES;
		while (parts.length > 1) {
			obj = ES[parts[0]];
			parts.shift();
		}

		var methodName = parts[0];

		var x = obj[methodName];
		if (x) {
			return x;
		}
		if (aoAliases[method]) {
			return ES[aoAliases[method]];
		}
		return null;
	};

	var ops = require('../../operations/' + (year === 5 ? 'es5' : year)); // eslint-disable-line global-require

	test('ES ' + year, function (t) {
		t.test('has expected operations', function (st) {
			var diff = diffOps(ES, ops, expectedMissing, []);

			st.deepEqual(diff.extra, [], 'no extra ops');

			st.deepEqual(diff.missing, [], 'no unexpected missing ops');

			st.deepEqual(diff.extraMissing, [], 'no unexpected "expected missing" ops');

			st.end();
		});

		runManifestTest(t.test, ES, year);

		t.test('Abstract Operations', function (st) {
			forEach(methods, function (method) {
				/** @type {import('../testHelpers').MethodTest<import('../testHelpers').AllAONames> | undefined} */
				var testMethod;
				try {
					testMethod = require('../' + path.join('./methods/', method.replace('::', '/'))); // eslint-disable-line global-require
				} catch (e) {
					var alias = aoAliases[method] || '';
					try {
						testMethod = require('../' + path.join('./methods/', alias.replace('::', '/'))); // eslint-disable-line global-require
					} catch (eA) {
						/** @type {Record<string, unknown>} */
						var data = { '*': true };
						data[method] = e;
						data[alias] = eA;
						console.error('could not find:', data);
						// throw [e, eA];
					}
				}

				st.test(method, { todo: !testMethod }, testMethod && function (s2t) {
					var ao = getAO(method);
					s2t.equal(typeof ao, 'function', method + ' exists');

					/** @type {NonNullable<typeof testMethod>} */ (testMethod)(
						s2t,
						year,
						ao,
						{
							getAO: getAO
						}
					);

					s2t.end();
				});
			});

			st.end();
		});

		t.end();
	});
};
