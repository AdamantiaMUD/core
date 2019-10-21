import GameState from '../../../lib/game-state';
import Player from '../../../lib/players/player';
import Quest from '../../../lib/quests/quest';
import QuestReward from '../../../lib/quests/quest-reward';
import {SimpleMap} from '../../../../index';

interface CurrencyRewardConfig extends SimpleMap {
    currency: string;
    amount: number;
}

/**
 * Quest reward that gives experience
 *
 * Config options:
 *   currency: string, required, currency to award
 *   amount: number, required
 */
export class CurrencyReward implements QuestReward {
    private getAmount(quest: Quest, config: CurrencyRewardConfig): number {
        if (!config.currency) {
            throw new Error(`Quest [${quest.id}] currency reward has invalid configuration`);
        }

        return config.amount;
    }

    public display(
        state: GameState,
        quest: Quest,
        config: CurrencyRewardConfig
    ): string {
        const amount = this.getAmount(quest, config);
        const friendlyName = config.currency
            .replace('_', ' ')
            .replace(/\b\w/gu, str => str.toUpperCase());

        return `Currency: <b>${amount}</b> x <b><white>[${friendlyName}]</white></b>`;
    }

    public reward(
        state: GameState,
        quest: Quest,
        config: CurrencyRewardConfig,
        player: Player
    ): void {
        const amount = this.getAmount(quest, config);

        player.emit('currency', config.currency, amount);
    }
}

export default CurrencyReward;