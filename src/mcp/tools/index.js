/**
 * @module logomarks/mcp/tools
 *
 * Every tool the MCP server offers, in the order an agent uses them: find
 * and get a mark; check, compare and look at one it drew; edit it (glitch,
 * edit by part, combine); build on it.
 */

import { tool as find } from './find.js';
import { tool as get } from './get.js';
import { tool as check } from './check.js';
import { tool as similar } from './similar.js';
import { tool as sheet } from './sheet.js';
import { tool as glitch } from './glitch.js';
import { tool as edit, parts } from './edit.js';
import { tool as combine } from './combine.js';
import { tool as kit } from './kit.js';
import { tool as social } from './social.js';
import { tool as mockup } from './mockup.js';
import { tool as cover } from './cover.js';

/** The tools, in order. */
export const TOOLS = [find, get, check, similar, sheet, parts, glitch, edit, combine, kit, social, mockup, cover];
