import GameState from '../game-state';
import Player from '../players/player';
import Quest from './quest';
import SimpleMap from '../util/simple-map';

export interface QuestRewardDefinition {
    config: SimpleMap;
    type: string;
}

/**
 * Representation of a quest reward
 * The {@link http://ranviermud.com/extending/areas/quests/|Quest guide} has instructions on to
 * create new reward type for quests
 */
export interface QuestReward {
    /**
     * Render the reward
     */
    display(state: GameState, quest: Quest, config?: SimpleMap, player?: Player): string;

    /**
     * Assign the reward to the player
     */
    reward(state: GameState, quest: Quest, config?: SimpleMap, player?: Player): void;
}

export default QuestReward;
