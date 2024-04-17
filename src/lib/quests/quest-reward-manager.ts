import type SimpleMap from '../util/simple-map.js';

import type QuestReward from './quest-reward.js';

/**
 * Simple map of quest reward name => class instance
 */
export class QuestRewardManager extends Map<string, QuestReward<SimpleMap>> {}

export default QuestRewardManager;
