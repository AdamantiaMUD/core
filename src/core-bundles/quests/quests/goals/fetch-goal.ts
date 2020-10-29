import QuestGoal from '../../../../lib/quests/quest-goal';
import {PlayerGetItemEvent, PlayerDropItemEvent, PlayerQuestStartedEvent} from '../../../../lib/players/events/index';
import {QuestProgressEvent} from '../../../../lib/quests/events/index';
import {ItemDecayEvent} from '../../../behaviors/behaviors/item/decay';

import type Item from '../../../../lib/equipment/item';
import type Player from '../../../../lib/players/player';
import type Quest from '../../../../lib/quests/quest';
import type QuestProgress from '../../../../lib/quests/quest-progress';
import type SimpleMap from '../../../../lib/util/simple-map';

interface FetchGoalConfig extends SimpleMap {
    title: string;
    removeItem: boolean;
    count: number;
    item: string;
}

interface FetchGoalState extends SimpleMap {
    count: number;
}

/**
 * A quest goal requiring the player picks up a certain number of a particular item
 */
export class FetchGoal extends QuestGoal<FetchGoalConfig, FetchGoalState> {
    public constructor(quest: Quest, config: FetchGoalConfig, player: Player) {
        super(quest, config, player);

        this.state = {count: 0};

        this.listen(PlayerGetItemEvent.getName(), this._getItem.bind(this));
        this.listen(PlayerDropItemEvent.getName(), this._dropItem.bind(this));
        this.listen(ItemDecayEvent.getName(), this._dropItem.bind(this));
        this.listen(PlayerQuestStartedEvent.getName(), this._checkInventory.bind(this));
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

    private _getItem(player: Player, item: Item): void {
        if (item.entityReference !== this.config.item) {
            return;
        }

        this.state.count += 1;

        if (this.state.count >= this.config.count) {
            return;
        }

        this.dispatch(new QuestProgressEvent({progress: this.getProgress()}));
    }

    private _dropItem(emitter: Item | Player, item: Item): void {
        if (this.state.count === 0 || item.entityReference !== this.config.item) {
            return;
        }

        this.state.count -= 1;

        if (this.state.count >= this.config.count) {
            return;
        }

        this.dispatch(new QuestProgressEvent({progress: this.getProgress()}));
    }

    private _checkInventory(): void {
        // when the quest is first started check the player's inventory for items they need
        for (const [, item] of this.player.inventory.items) {
            this._getItem(this.player, item);
        }
    }
}

export default FetchGoal;
