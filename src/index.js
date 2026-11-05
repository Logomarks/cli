/**
 * @module logomarks
 *
 * Check logomarks the way the Logomarks set is checked: the house rules
 * (`check`, `fix`), the nearest live marks (`similar`), and review cards to
 * look at (`sheet`); searching the live set (`findMarks`). Then build a brand on one: the mark itself (`loadMark`,
 * `paint`, `markPng`), a starter kit (`kit`), mockups (`mockup`) and covers
 * (`cover`). The same functions run the `logomarks` command and its MCP
 * server (`logomarks/mcp`).
 */

export { check, fix } from './checks/index.js';
export { FINDINGS } from './checks/finding.js';
export { similar } from './similar/nearest.js';
export { loadIndex } from './similar/store.js';
export { findMarks, facets } from './find/index.js';
export { sheet } from './sheet/index.js';
export { fitMark } from '@logomarks/core/fit';
export * as rules from './rules.js';
export { loadMark, findMark, paint, markPng, MarkNotFound } from './brand/mark.js';
export { palette, parseColor, contrast } from './brand/color.js';
export { lockup } from './brand/lockup.js';
export { artwork } from './brand/artwork.js';
export { FONTS } from './brand/fonts.js';
export { kit } from './kit/index.js';
export { mockup, OBJECTS } from './mockup/index.js';
export { cover, RECIPES } from './cover/index.js';
