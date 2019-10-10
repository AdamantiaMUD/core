import Effect from '../effects/effect';

export class AbilityError extends Error {}

/**
 * Error used when trying to execute a skill and the player doesn't have enough resources
 */
export class NotEnoughResourcesError extends AbilityError {}

/**
 * Error used when trying to execute a passive skill
 */
export class PassiveError extends AbilityError {}

/**
 * Error used when trying to execute a skill on cooldown
 * @property {Effect} effect
 */
export class CooldownError extends AbilityError {
    /* eslint-disable lines-between-class-members */
    public effect: Effect;
    /* eslint-enable lines-between-class-members */

    /**
     * @param {Effect} effect Cooldown effect that triggered this error
     */
    public constructor(effect: Effect) {
        super();

        this.effect = effect;
    }
}

export default {
    CooldownError,
    NotEnoughResourcesError,
    PassiveError,
    SkillError: AbilityError,
};
