/**
 * @module logomarks
 *
 * Check logomarks the way the Logomarks set is checked: the house rules
 * (`check`, `fix`), the nearest live marks (`similar`), and review cards to
 * look at (`sheet`). The same functions run the `logomarks` command.
 */

export { check, fix } from './checks/index.js';
export { FINDINGS } from './checks/finding.js';
export { similar } from './similar/nearest.js';
export { loadIndex } from './similar/store.js';
export { sheet } from './sheet/index.js';
export { fitMark } from './svg/fit.js';
export * as rules from './rules.js';
