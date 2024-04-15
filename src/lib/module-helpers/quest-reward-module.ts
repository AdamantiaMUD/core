import type QuestReward from '../quests/quest-reward.js';
import type SimpleMap from '../util/simple-map.js';

export interface QuestRewardModule {
    default: QuestReward<SimpleMap>;
}

export default QuestRewardModule;
