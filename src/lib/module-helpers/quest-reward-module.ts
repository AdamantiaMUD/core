import type QuestReward from '../quests/quest-reward';
import type SimpleMap from '../util/simple-map';

export interface QuestRewardModule {
    default: QuestReward<SimpleMap>;
}

export default QuestRewardModule;
