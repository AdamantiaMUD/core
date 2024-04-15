import CombatError from './combat-error.js';

/**
 * Error used when a target tries to attack themselves
 */
export class CombatTargetSelfError extends CombatError {}

export default CombatTargetSelfError;
