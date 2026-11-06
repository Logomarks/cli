/**
 * @module logomarks/cli/commands
 *
 * The verbs, by name.
 */

import * as check from './check.js';
import * as similar from './similar.js';
import * as specks from './specks.js';
import * as sheet from './sheet.js';
import * as get from './get.js';
import * as kit from './kit.js';
import * as mockup from './mockup.js';
import * as cover from './cover.js';
import * as parts from './parts.js';
import * as glitch from './glitch.js';
import * as edit from './edit.js';
import * as combine from './combine.js';
import * as social from './social.js';
import * as find from './find.js';
import * as mcp from './mcp.js';

/** Every verb the CLI runs. */
export const COMMANDS = { check, similar, specks, sheet, find, parts, glitch, edit, combine, get, kit, social, mockup, cover, mcp };
