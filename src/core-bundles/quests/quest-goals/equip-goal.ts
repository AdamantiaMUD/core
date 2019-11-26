import Character from '~/lib/characters/character';
import Player from '~/lib/players/player';
import Quest, {QuestProgress} from '~/lib/quests/quest';
import QuestGoal from '~/lib/quests/quest-goal';
import SimpleMap from '~/lib/util/simple-map';
import {
    CharacterEquipItemEvent,
    CharacterEquipItemPayload,
    CharacterUnequipItemEvent,
    CharacterUnequipItemPayload,
} from '~/lib/characters/character-events';
import {QuestProgressEvent} from '~/lib/quests/quest-events';

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

        this.listen(CharacterEquipItemEvent.getName(), this.equipItem.bind(this));
        this.listen(CharacterUnequipItemEvent.getName(), this.unequipItem.bind(this));
    }

    public getProgress(): QuestProgress {
        const percent = this.state.equipped ? 100 : 0;
        const display = `${this.config.title}: ${this.state.equipped ? '' : 'Not '}Equipped`;

        return {percent, display};
    }

    private equipItem(character: Character, payload: CharacterEquipItemPayload): void {
        const {slot} = payload;

        if (slot !== this.config.slot) {
            return;
        }

        this.state.equipped = true;
        this.dispatch(new QuestProgressEvent({progress: this.getProgress()}));
    }

    private unequipItem(character: Character, payload: CharacterUnequipItemPayload): void {
        const {slot} = payload;

        if (slot !== this.config.slot) {
            return;
        }

        this.state.equipped = false;
        this.dispatch(new QuestProgressEvent({progress: this.getProgress()}));
    }
}

export default EquipGoal;
