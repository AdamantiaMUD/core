import type SerializedQuest from './serialized-quest';
import type SimpleMap from '../util/simple-map';

export interface SerializedQuestTracker extends SimpleMap {
    active: {[key: string]: SerializedQuest};
    completed: {[key: string]: SerializedQuest};
}

export default SerializedQuestTracker;
