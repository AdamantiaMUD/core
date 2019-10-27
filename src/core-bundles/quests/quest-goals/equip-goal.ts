import Player from '../../../lib/players/player';
import Quest from '../../../lib/quests/quest';
import QuestGoal from '../../../lib/quests/quest-goal';
import SimpleMap from '../../../lib/util/simple-map';

/**
 * A quest goal requiring the player equip something to a particular slot
 */
export class EquipGoal extends QuestGoal {
    public constructor(quest: Quest, cfg: SimpleMap, player: Player) {
        const config = {
            title: 'Equip Item',
            slot: null,
            ...cfg,
        };

        super(quest, config, player);

        this.state = {equipped: false};

        this.on('equip', this.equipItem);
        this.on('unequip', this.unequipItem);
    }

    public getProgress(): {percent: number; display: string} {
        const percent = this.state.equipped ? 100 : 0;
        const display = `${this.config.title}: ${this.state.equipped ? '' : 'Not '}Equipped`;

        return {percent, display};
    }

    private equipItem(slot): void {
        if (slot !== this.config.slot) {
            return;
        }

        this.state.equipped = true;
        this.emit('progress', this.getProgress());
    }

    private unequipItem(slot): void {
        if (slot !== this.config.slot) {
            return;
        }

        this.state.equipped = false;
        this.emit('progress', this.getProgress());
    }
}

export default EquipGoal;
