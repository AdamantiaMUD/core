import type SimpleMap from '../util/simple-map.js';

import type SerializedQuest from './serialized-quest.js';

export interface SerializedQuestTracker extends SimpleMap {
    active: SimpleMap<SerializedQuest>;
    completed: SimpleMap<SerializedQuest>;
}

export default SerializedQuestTracker;
