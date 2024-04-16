import type SimpleMap from '../util/simple-map.js';

export interface QuestGoalDefinition<
    QuestConfig extends SimpleMap = SimpleMap,
> {
    config: QuestConfig;
    type: string;
}

export default QuestGoalDefinition;
