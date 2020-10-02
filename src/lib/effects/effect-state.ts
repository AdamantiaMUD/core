export interface EffectState {
    lastTick?: number;
    stacks?: number;
    tickInterval?: number;
    ticks?: number;
    [key: string]: unknown;
}

export default EffectState;
