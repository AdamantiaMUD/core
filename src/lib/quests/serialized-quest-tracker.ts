import type SerializedQuest from './serialized-quest.js';
import type SimpleMap from '../util/simple-map.js';

export interface SerializedQuestTracker extends SimpleMap {
    active: SimpleMap<SerializedQuest>;
    completed: SimpleMap<SerializedQuest>;
}

export default SerializedQuestTracker;
