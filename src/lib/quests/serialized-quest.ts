import type QuestProgress from './quest-progress';
import type SimpleMap from '../util/simple-map';
import type SerializedQuestGoal from './serialized-quest-goal';

export interface SerializedQuest extends SimpleMap {
    config: {desc: string; level: number; title: string};
    progress: QuestProgress;
    state: SerializedQuestGoal[];
}

export default SerializedQuest;
