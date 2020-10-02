export interface EffectConfig {
    autoActivate?: boolean;
    description?: string;
    duration?: number;
    hidden?: boolean;
    maxStacks?: number;
    name: string;
    persists?: boolean;
    refreshes?: boolean;
    tickInterval?: number;
    type?: string;
    unique?: boolean;
}

export default EffectConfig;
