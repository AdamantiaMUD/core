export type EffectState = {[key: string]: unknown} & {
    lastTick?: number;
    stacks?: number;
    tickInterval?: number;
    ticks?: number;
};

export default EffectState;
