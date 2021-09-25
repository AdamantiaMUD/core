export type EffectState = Record<string, unknown> & {
    lastTick?: number;
    stacks?: number;
    tickInterval?: number;
    ticks?: number;
};

export default EffectState;
