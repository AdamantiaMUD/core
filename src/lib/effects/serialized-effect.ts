import type EffectConfig from './effect-config';
import type EffectState from './effect-state';
import type SimpleMap from '../util/simple-map';

export interface SerializedEffect extends SimpleMap {
    ability?: string;
    config: EffectConfig;
    elapsed: number;
    id: string;
    remaining: number;
    state: EffectState;
}

export default SerializedEffect;
