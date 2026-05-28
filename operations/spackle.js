'use strict';

const path = require('path');
const fs = require('fs');
const childProcess = require('child_process');

const { ESLint } = require('eslint');

const deltas = require('./deltas');
const years = require('./years');

const allOps = {};
function addOpToYear(year, op, opPath) {
	allOps[year] ||= new Map();
	if (op === opPath) {
		allOps[year].set(op, `${year}/${opPath}`);
	} else {
		const baseOp = op.replace(/::.*$/, '');
		allOps[year].set(baseOp, `${year}/${baseOp}`);
	}
}

const writtenOps = [5].concat(years).flatMap((year, i, arr) => {
	const ops = fs.readdirSync(path.join(process.cwd(), String(year)));
	return ops.flatMap((opFile) => {
		const maybeDirPath = path.join(process.cwd(), String(year), opFile);
		if (fs.statSync(maybeDirPath).isDirectory()) {
			return fs.readdirSync(maybeDirPath).map((x) => `${opFile}::${path.basename(x, path.extname(x))}`);
		}

		if (year === 2023 && opFile === 'TypedArrayCreate.js') {
			return [];
		}
		return opFile;
	}).map((opFile) => {
		const op = path.basename(opFile, path.extname(opFile));
		const opPath = op.replace('::', '/');
		const isEntryPoint = !opPath.startsWith('tables/');
		const thisFile = path.join(process.cwd(), String(year), `${opPath}.js`);
		if (isEntryPoint) {
			addOpToYear(year, op, opPath);
		}
		if ((i + 1) < arr.length) {
			const nextYear = arr[i + 1];
			const nextFile = path.join(process.cwd(), String(nextYear), `${opPath}.js`);
			fs.mkdirSync(path.dirname(nextFile), { recursive: true });
			if (!deltas[nextYear].removed.has(op)) {
				if (isEntryPoint) {
					addOpToYear(nextYear, op, opPath);
				}

				if (fs.existsSync(thisFile) && !fs.existsSync(nextFile)) {
					if (year === 2023 && op === 'TypedArrayCreate') {
						// this AO was renamed in ES2024, and the new one can't be implemented
						return null;
					}
					console.log(`writing: ${nextYear}/${opPath} -> ${year}/${opPath}`);
					const thisSpecifier = `../${year}/${opPath}`;
					const reexport = `'use strict';

		module.exports = require('${thisSpecifier}');
		`;
					const replacement = fs.readFileSync(thisFile, 'utf-8');
					fs.writeFileSync(nextFile, process.argv[2] ? replacement : reexport);
					return {
						isEntryPoint,
						op,
						opFile: path.relative(process.cwd(), nextFile),
						year: nextYear,
					};
				}
			}
		}
		return null;
	});
}).filter(Boolean);

const exceptions = require('../test/helpers/aoMap.json');

const willBeQuotedOp = (/^'[^' ]+ [^']+'/);

function compareOps(a, b) {
	const aQ = willBeQuotedOp.test(a);
	const bQ = willBeQuotedOp.test(b);

	if ((aQ || bQ) && !(aQ && bQ)) {
		return aQ ? -1 : 1;
	}

	return a.localeCompare(b);
}

const writtenManifestsP = years.map(async (year) => {
	const edition = year - 2009;
	const contents = `'use strict';

/* eslint global-require: 0 */
// https://262.ecma-international.org/${edition}.0/#sec-abstract-operations
var ES${year} = {
	${Array.from(allOps[year], ([op, opFile]) => `'${exceptions[op] || op}': require('./${opFile}')`).sort(compareOps).join(',\n\t')}
};

module.exports = ES${year};
`;
	const filename = `es${String(year)}.js`;
	const eslint = new ESLint({ fix: true });
	await eslint.lintText(contents, { filePath: filename }).then(([{ output }]) => {
		fs.writeFileSync(path.join(process.cwd(), filename), output);
	}).catch((error) => {
		console.error(error);
		process.exitCode = 1;
	});

	return filename;
});

const indexPath = path.join(process.cwd(), 'index.js');

function safeIdent(name) {
	if ((/^[A-Za-z_$][\w$]*$/).test(name)) {
		return name;
	}
	const cleaned = name.replace(/[^\w$]+/g, '');
	return (/^[0-9]/).test(cleaned) ? `$${cleaned}` : cleaned;
}

function literalKey(key) {
	return (/^[A-Za-z_$][\w$]*$/).test(key) ? key : `'${key}'`;
}

function memberAccess(src, key) {
	return (/^[A-Za-z_$][\w$]*$/).test(key) ? `${src}.${key}` : `${src}['${key}']`;
}

/*
 * Regenerate index.js as a single `module.exports = {...}` literal whose
 * property values are all Identifier references. cjs-module-lexer detects
 * every named export, satisfying Node ESM `import { ES2015 }` and attw's
 * NamedExports check, while the lone assignment keeps the original Node
 * exports object intact (no cycle-vulnerable post-assignment mutation).
 */
async function regenerateIndex() {
	const es5Path = path.join(process.cwd(), 'es5');
	const es2015Path = path.join(process.cwd(), 'es2015');
	delete require.cache[require.resolve(es5Path)];
	delete require.cache[require.resolve(es2015Path)];
	const ES5 = require(es5Path); // eslint-disable-line global-require
	const ES2015 = require(es2015Path); // eslint-disable-line global-require

	const methodSource = new Map();
	Object.keys(ES5)
		.filter((k) => k !== 'CheckObjectCoercible')
		.forEach((k) => {
			methodSource.set(k, 'ES5');
		});

	Object.keys(ES2015).forEach((k) => {
		methodSource.set(k, 'ES2015');
	});

	const allYears = [5].concat(years);
	const yearRequires = allYears.map((y) => `var ES${y} = require('./es${y}');`).join('\n');
	const yearAliases = 'var ES6 = ES2015;\nvar ES7 = ES2016;';

	const methodKeys = Array.from(methodSource.keys()).sort(compareOps);
	const methodVars = methodKeys.map((key) => `var ${safeIdent(key)} = ${memberAccess(methodSource.get(key), key)};`).join('\n');

	const yearEntries = allYears.flatMap((y) => [].concat(
		`\tES${y}: ES${y}`,
		y === 2015 ? '\tES6: ES6' : [],
		y === 2016 ? '\tES7: ES7' : [],
	));
	const methodEntries = methodKeys.map((key) => `\t${literalKey(key)}: ${safeIdent(key)}`);
	const literalBody = yearEntries.concat(methodEntries).join(',\n');

	const generated = `'use strict';

// <generated> -- regenerated by \`npm run spackle\`; do not edit

${yearRequires}

${yearAliases}

${methodVars}

module.exports = {
${literalBody}
};
// </generated>
`;

	const eslint = new ESLint({ fix: true });
	await eslint.lintText(generated, { filePath: indexPath })
		.then(([{ output }]) => {
			fs.writeFileSync(indexPath, output || generated);
		}).catch((error) => {
			console.error(error);
			process.exitCode = 1;
		});
}

Promise.all(writtenManifestsP).then(async (writtenManifests) => {
	await regenerateIndex();

	const writtenFiles = writtenManifests.concat(writtenOps.map(({ opFile }) => opFile));

	fs.writeFileSync(
		path.join(
			process.cwd(),
			'.gitattributes',
		),
		[].concat(
			'/helpers/caseFolding.json\tlinguist-generated=true',
			writtenFiles.map((x) => `/${x}\tspackled linguist-generated=true`),
		).join('\n'),
	);
	childProcess.execSync(`git add .gitattributes ${writtenFiles.join(' ')} ${indexPath}`);
});
