import QuestReward from './quest-reward';

/**
 * Simple map of quest reward name => class instance
 */
export class QuestRewardManager extends Map<string, QuestReward> {}

export default QuestRewardManager;
