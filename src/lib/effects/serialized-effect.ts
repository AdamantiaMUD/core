import type SimpleMap from '../util/simple-map.js';

import type EffectConfig from './effect-config.js';
import type EffectState from './effect-state.js';

export interface SerializedEffect extends SimpleMap {
    ability?: string;
    config: EffectConfig;
    elapsed: number;
    id: string;
    remaining: number;
    state: EffectState;
}

export default SerializedEffect;
