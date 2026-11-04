/**
 * @module logomarks/cli/commands
 *
 * The verbs, by name.
 */

import * as check from './check.js';
import * as similar from './similar.js';
import * as sheet from './sheet.js';

/** Every verb the CLI runs. */
export const COMMANDS = { check, similar, sheet };
