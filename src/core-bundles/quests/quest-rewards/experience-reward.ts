import GameState from '~/lib/game-state';
import LevelUtil from '~/lib/util/level-util';
import Player from '~/lib/players/player';
import Quest from '~/lib/quests/quest';
import QuestReward from '~/lib/quests/quest-reward';
import SimpleMap from '~/lib/util/simple-map';
import {PlayerExperienceEvent} from '~/lib/players/player-events';

interface ExperienceRewardConfig extends SimpleMap {
    amount?: number;
    leveledTo?: 'PLAYER' | 'QUEST';
}

const DEFAULT_CONFIG: ExperienceRewardConfig = {
    amount: 0,
    leveledTo: null,
};

/**
 * Quest reward that gives experience
 *
 * Config options:
 *   amount: number, default: 0, Either a static amount or a multipler to use
 *                               for leveledTo
 *   leveledTo: "PLAYER"|"QUEST", default: null, If set scale the amount to
 *                                               either the quest's or player's
 *                                               level
 *
 * Examples:
 *
 *   Gives equivalent to 5 times mob xp for a mob of the quests level
 *     amount: 5
 *     leveledTo: quest
 *
 *   Gives a static 500 xp
 *     amount: 500
 */
export class ExperienceReward implements QuestReward {
    private getAmount(quest: Quest, config: ExperienceRewardConfig, player: Player): number {
        let amount = config.amount;

        if (config.leveledTo) {
            const level = config.leveledTo === 'PLAYER' ? player.level : quest.config.level;

            amount *= LevelUtil.mobExp(level);
        }

        return amount;
    }

    public display(
        state: GameState,
        quest: Quest,
        config: ExperienceRewardConfig = DEFAULT_CONFIG,
        player: Player
    ): string {
        const amount = this.getAmount(quest, config, player);

        return `Experience: <b>${amount}</b>`;
    }

    public reward(
        state: GameState,
        quest: Quest,
        config: ExperienceRewardConfig = DEFAULT_CONFIG,
        player: Player
    ): void {
        const amount = this.getAmount(quest, config, player);

        player.dispatch(new PlayerExperienceEvent({amount}));
    }
}

export default ExperienceReward;
