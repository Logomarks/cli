/**
 * @module logomarks/util/version
 *
 * The package's version, from its `package.json`.
 */

import fs from 'node:fs';

/** The installed version of `logomarks`. */
export const VERSION = /** @type {string} */ (JSON.parse(fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf8')).version);
