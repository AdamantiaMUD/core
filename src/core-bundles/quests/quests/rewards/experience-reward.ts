import type GameStateData from '../../../../lib/game-state-data.js';
import { PlayerExperienceEvent } from '../../../../lib/players/events/index.js';
import type Player from '../../../../lib/players/player.js';
import type QuestReward from '../../../../lib/quests/quest-reward.js';
import type Quest from '../../../../lib/quests/quest.js';
import { hasValue } from '../../../../lib/util/functions.js';
import LevelUtil from '../../../../lib/util/level-util.js';
import type SimpleMap from '../../../../lib/util/simple-map.js';

interface ExperienceRewardConfig extends SimpleMap {
    amount: number;
    leveledTo: 'PLAYER' | 'QUEST' | null;
}

const DEFAULT_CONFIG: ExperienceRewardConfig = {
    amount: 0,
    leveledTo: null,
};

/**
 * Quest reward that gives experience
 *
 * Config options:
 *   amount: number, default: 0, Either a static amount or a multiplier to use
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
export class ExperienceReward implements QuestReward<ExperienceRewardConfig> {
    private static _getAmount(
        quest: Quest,
        config: ExperienceRewardConfig,
        player: Player
    ): number {
        let amount = config.amount;

        if (hasValue(config.leveledTo)) {
            const level =
                config.leveledTo === 'PLAYER'
                    ? player.level
                    : quest.config.level;

            amount *= LevelUtil.mobExp(level ?? 1);
        }

        return amount;
    }

    public display(
        state: GameStateData,
        quest: Quest,
        player: Player,
        config: ExperienceRewardConfig = DEFAULT_CONFIG
    ): string {
        const amount = ExperienceReward._getAmount(quest, config, player);

        return `Experience: {bold ${amount}}`;
    }

    public reward(
        state: GameStateData,
        quest: Quest,
        player: Player,
        config: ExperienceRewardConfig = DEFAULT_CONFIG
    ): void {
        const amount = ExperienceReward._getAmount(quest, config, player);

        player.dispatch(new PlayerExperienceEvent({ amount }));
    }
}

export default ExperienceReward;
