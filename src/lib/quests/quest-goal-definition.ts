import type SimpleMap from '../util/simple-map';

export interface QuestGoalDefinition<QuestConfig extends SimpleMap = SimpleMap> {
    config: QuestConfig;
    type: string;
}

export default QuestGoalDefinition;
