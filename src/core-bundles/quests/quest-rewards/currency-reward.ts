import GameState from '../../../lib/game-state';
import Player from '../../../lib/players/player';
import Quest from '../../../lib/quests/quest';
import QuestReward from '../../../lib/quests/quest-reward';
import SimpleMap from '../../../lib/util/simple-map';
import {PlayerCurrencyGainedEvent} from '../../../lib/players/player-events';

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

        player.dispatch(new PlayerCurrencyGainedEvent({
            amount: amount,
            denomination: config.currency,
        }));
    }
}

export default CurrencyReward;
