import CombatError from './combat-error.js';

/**
 * Error used when a combat target is invalid for some reason (doesn't have a
 * hp attribute/whatever)
 */
export class CombatInvalidTargetError extends CombatError {}

export default CombatInvalidTargetError;
