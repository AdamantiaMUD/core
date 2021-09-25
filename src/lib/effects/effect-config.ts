export interface EffectConfig {
    /*  eslint-disable-next-line lines-around-comment -- see https://github.com/typescript-eslint/typescript-eslint/issues/1150 */
    /**
     * If this effect immediately activates itself when added to the target
     */
    autoActivate?: boolean;

    /**
     * longer description
     */
    description?: string;

    /**
     * Optional
     * Duration of this effect in milliseconds.
     * Default: Infinity
     */
    duration?: number;

    /**
     * If this effect is shown in the character's effect list
     */
    hidden?: boolean;

    /**
     * When adding an effect of the same type it adds a stack to the current
     * effect up to maxStacks instead of adding the effect. Implies `unique` is
     * set to true.
     */
    maxStacks?: number;

    /**
     * Required
     * The name of effect. This is shown when the player uses the `effects`
     * command
     */
    name: string;

    /**
     * whether the effect persists when the player logs off and back on
     */
    persists?: boolean;

    /**
     * This will configure the effect so that if another effect of the same
     * type is applied before the effect is finished it will receive a
     * "effectRefreshed" event to do with as it will.
     */
    refreshes?: boolean;

    /**
     * tickInterval defines how many seconds between consecutive `updateTick` events
     * Note: This is _seconds_, not _milliseconds_ which is duration
     */
    tickInterval?: number;

    /**
     * Type is an optional config which is used in conjunction with the
     * `unique` config option. If an effect is unique only one effect of that
     * type may be active at once.
     */
    type?: string;

    /**
     * controls whether an effect can be applied multiple times; used in
     * conjunction with `type` and `maxStacks`
     */
    unique?: boolean;
}

export default EffectConfig;
