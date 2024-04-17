import type SimpleMap from '../util/simple-map.js';

import type QuestProgress from './quest-progress.js';
import type SerializedQuestGoal from './serialized-quest-goal.js';

export interface SerializedQuest extends SimpleMap {
    config: { desc: string; level: number; title: string };
    progress: QuestProgress;
    state: SerializedQuestGoal[];
}

export default SerializedQuest;
