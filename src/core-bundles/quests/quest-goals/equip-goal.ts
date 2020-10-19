import QuestGoal from '../../../lib/quests/quest-goal';
import {CharacterEquipItemEvent, CharacterUnequipItemEvent} from '../../../lib/characters/events';
import {QuestProgressEvent} from '../../../lib/quests/events';

import type Character from '../../../lib/characters/character';
import type Player from '../../../lib/players/player';
import type Quest from '../../../lib/quests/quest';
import type QuestProgress from '../../../lib/quests/quest-progress';
import type SimpleMap from '../../../lib/util/simple-map';
import type {CharacterEquipItemPayload, CharacterUnequipItemPayload} from '../../../lib/characters/events';

interface EquipGoalConfig extends SimpleMap {
    title: string;
    slot: string;
}

interface EquipGoalState extends SimpleMap {
    equipped: boolean;
}

/**
 * A quest goal requiring the player equip something to a particular slot
 */
export class EquipGoal extends QuestGoal<EquipGoalConfig, EquipGoalState> {
    public constructor(quest: Quest, config: EquipGoalConfig, player: Player) {
        super(quest, config, player);

        this.state = {equipped: false};

        this.listen(CharacterEquipItemEvent.getName(), this._equipItem.bind(this));
        this.listen(CharacterUnequipItemEvent.getName(), this._unequipItem.bind(this));
    }

    public getProgress(): QuestProgress {
        const percent = this.state.equipped ? 100 : 0;
        const display = `${this.config.title}: ${this.state.equipped ? '' : 'Not '}Equipped`;

        return {percent, display};
    }

    private _equipItem(character: Character, payload: CharacterEquipItemPayload): void {
        const {slot} = payload;

        if (slot !== this.config.slot) {
            return;
        }

        this.state.equipped = true;
        this.dispatch(new QuestProgressEvent({progress: this.getProgress()}));
    }

    private _unequipItem(character: Character, payload: CharacterUnequipItemPayload): void {
        const {slot} = payload;

        if (slot !== this.config.slot) {
            return;
        }

        this.state.equipped = false;
        this.dispatch(new QuestProgressEvent({progress: this.getProgress()}));
    }
}

export default EquipGoal;
