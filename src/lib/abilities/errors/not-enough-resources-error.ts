import AbilityError from './ability-error';

/**
 * Error used when trying to execute a skill and the player doesn't have enough resources
 */
export class NotEnoughResourcesError extends AbilityError {}

export default NotEnoughResourcesError;
