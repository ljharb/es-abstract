'use strict';

/** @type {(a: import('../types').integer, z: import('../types').integer) => import('../types').integer[]} */
function range(a, z) {
	return Array.from({ length: z + 1 - a }, (_, i) => i + a);
}

/** @type {readonly (2015 | 2016 | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024)[]} */
module.exports = Object.freeze(range(2015, 2024));
