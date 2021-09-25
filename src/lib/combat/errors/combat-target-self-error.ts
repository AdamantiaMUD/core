import CombatError from './combat-error';

/**
 * Error used when a target tries to attack themselves
 */
export class CombatTargetSelfError extends CombatError {}

export default CombatTargetSelfError;
