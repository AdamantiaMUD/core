import type SerializedQuest from './serialized-quest';
import type SimpleMap from '../util/simple-map';

export interface SerializedQuestTracker extends SimpleMap {
    active: SimpleMap<SerializedQuest>;
    completed: SimpleMap<SerializedQuest>;
}

export default SerializedQuestTracker;
