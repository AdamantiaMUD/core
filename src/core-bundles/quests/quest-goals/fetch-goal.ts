import Inventory from '../../../lib/equipment/inventory';
import Item from '../../../lib/equipment/item';
import Player from '../../../lib/players/player';
import Quest from '../../../lib/quests/quest';
import QuestGoal from '../../../lib/quests/quest-goal';
import {SimpleMap} from '../../../../index';

/**
 * A quest goal requiring the player picks up a certain number of a particular item
 */
export class FetchGoal extends QuestGoal {
    public constructor(quest: Quest, cfg: SimpleMap, player: Player) {
        const config = {
            title: 'Retrieve Item',
            removeItem: false,
            count: 1,
            item: null,
            ...cfg,
        };

        super(quest, config, player);

        this.state = {count: 0};

        this.on('get', this.getItem);
        this.on('drop', this.dropItem);
        this.on('decay', this.dropItem);
        this.on('start', this.checkInventory);
    }

    public getProgress(): {percent: number; display: string} {
        const amount = Math.min(this.config.count, this.state.count);
        const percent = (amount / this.config.count) * 100;
        const display = `${this.config.title}: [${amount}/${this.config.count}]`;

        return {percent, display};
    }

    public complete(): void {
        if (this.state.count < this.config.count) {
            return;
        }

        const player = this.quest.player;

        // this fetch quest by default removes all the quest items from the player inv
        if (this.config.removeItem) {
            for (let i = 0; i < this.config.count; i++) {
                for (const [, item] of player.inventory.items) {
                    /* eslint-disable-next-line max-depth */
                    if (item.entityReference === this.config.item) {
                        this.quest.GameState.itemManager.remove(item);
                        break;
                    }
                }
            }
        }

        super.complete();
    }

    private getItem(item: Item): void {
        if (item.entityReference !== this.config.item) {
            return;
        }

        this.state.count = (this.state.count || 0) + 1;

        if (this.state.count > this.config.count) {
            return;
        }

        this.emit('progress', this.getProgress());
    }

    private dropItem(item: Item): void {
        if (!this.state.count || item.entityReference !== this.config.item) {
            return;
        }

        this.state.count -= 1;

        if (this.state.count >= this.config.count) {
            return;
        }

        this.emit('progress', this.getProgress());
    }

    private checkInventory(): void {
        // when the quest is first started check the player's inventory for items they need
        if (!(this.player.inventory instanceof Inventory)) {
            return;
        }

        for (const [, item] of this.player.inventory.items) {
            this.getItem(item);
        }
    }
}

export default FetchGoal;
