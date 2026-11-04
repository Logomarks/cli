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
import * as find from './find.js';
import * as mcp from './mcp.js';

/** Every verb the CLI runs. */
export const COMMANDS = { check, similar, sheet, find, get, kit, mockup, cover, mcp };
