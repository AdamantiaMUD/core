import AbilityError from './ability-error';

import type Effect from '../../effects/effect';

/**
 * Error used when trying to execute a skill on cooldown
 * @property {Effect} effect
 */
export class CooldownError extends AbilityError {
    public effect: Effect;

    /**
     * @param {Effect} effect Cooldown effect that triggered this error
     */
    public constructor(effect: Effect) {
        super();

        this.effect = effect;
    }
}

export default CooldownError;
