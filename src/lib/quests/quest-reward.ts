import type GameStateData from '../game-state-data';
import type Player from '../players/player';
import type Quest from './quest';
import type SimpleMap from '../util/simple-map';

/**
 * Representation of a quest reward
 * The {@link http://ranviermud.com/extending/areas/quests/|Quest guide} has instructions on to
 * create new reward type for quests
 */
export interface QuestReward<T extends SimpleMap> {
    /*  eslint-disable-next-line lines-around-comment -- see https://github.com/typescript-eslint/typescript-eslint/issues/1150 */
    /**
     * Render the reward
     */
    display: ((state: GameStateData, quest: Quest, player: Player, config: T) => string)
    | ((state: GameStateData, quest: Quest, player: Player) => string)
    | ((state: GameStateData, quest: Quest) => string);

    /**
     * Assign the reward to the player
     */
    reward: ((state: GameStateData, quest: Quest, player: Player, config: T) => void)
    | ((state: GameStateData, quest: Quest, player: Player) => void)
    | ((state: GameStateData, quest: Quest) => void);
}

export default QuestReward;
