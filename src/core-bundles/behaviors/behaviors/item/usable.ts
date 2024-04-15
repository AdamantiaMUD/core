import type BehaviorDefinition from '../../../../lib/behaviors/behavior-definition.js';
import type SimpleMap from '../../../../lib/util/simple-map.js';

export interface UsableConfig extends SimpleMap {
    effect?: string;
    config?: SimpleMap;
    state?: SimpleMap;

    spell?: string;
    options?: SimpleMap;

    charges?: number;
    destroyOnDepleted: boolean;
    cooldown?: number;
}

export const usable: BehaviorDefinition = {
    listeners: {},
};

export default usable;
