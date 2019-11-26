import Inventory from '~/lib/equipment/inventory';
import Item from '~/lib/equipment/item';
import Player from '~/lib/players/player';
import Quest, {QuestProgress} from '~/lib/quests/quest';
import QuestGoal from '~/lib/quests/quest-goal';
import SimpleMap from '~/lib/util/simple-map';
import {
    PlayerGetItemEvent,
    PlayerDropItemEvent,
    PlayerQuestStartedEvent,
} from '~/lib/players/player-events';
import {QuestProgressEvent} from '~/lib/quests/quest-events';
import {ItemDecayEvent} from '../../behaviors/behaviors/item/decay';

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

        this.listen(PlayerGetItemEvent.getName(), this.getItem.bind(this));
        this.listen(PlayerDropItemEvent.getName(), this.dropItem.bind(this));
        this.listen(ItemDecayEvent.getName(), this.dropItem.bind(this));
        this.listen(PlayerQuestStartedEvent.getName(), this.checkInventory.bind(this));
    }

    public getProgress(): QuestProgress {
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

    private getItem(player: Player, item: Item): void {
        if (item.entityReference !== this.config.item) {
            return;
        }

        this.state.count = (this.state.count || 0) + 1;

        if (this.state.count > this.config.count) {
            return;
        }

        this.dispatch(new QuestProgressEvent({progress: this.getProgress()}));
    }

    private dropItem(emitter: Item | Player, item: Item): void {
        if (!this.state.count || item.entityReference !== this.config.item) {
            return;
        }

        this.state.count -= 1;

        if (this.state.count >= this.config.count) {
            return;
        }

        this.dispatch(new QuestProgressEvent({progress: this.getProgress()}));
    }

    private checkInventory(): void {
        // when the quest is first started check the player's inventory for items they need
        if (!(this.player.inventory instanceof Inventory)) {
            return;
        }

        for (const [, item] of this.player.inventory.items) {
            this.getItem(this.player, item);
        }
    }
}

export default FetchGoal;
