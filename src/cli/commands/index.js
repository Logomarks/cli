/**
 * @module logomarks/cli/commands
 *
 * The verbs, by name.
 */

import * as check from './check.js';
import * as similar from './similar.js';
import * as sheet from './sheet.js';
import * as get from './get.js';
import * as kit from './kit.js';
import * as mockup from './mockup.js';
import * as cover from './cover.js';

/** Every verb the CLI runs. */
export const COMMANDS = { check, similar, sheet, get, kit, mockup, cover };
