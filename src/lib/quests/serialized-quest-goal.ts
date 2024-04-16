import type SimpleMap from '../util/simple-map.js';

export interface SerializedQuestGoal<
    QuestConfig extends SimpleMap = SimpleMap,
    QuestState extends SimpleMap = SimpleMap,
> extends SimpleMap {
    config: QuestConfig;
    state: QuestState;
}

export default SerializedQuestGoal;
