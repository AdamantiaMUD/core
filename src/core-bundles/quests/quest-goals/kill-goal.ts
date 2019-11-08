import Character from '../../../lib/characters/character';
import Player from '../../../lib/players/player';
import Quest, {QuestProgress} from '../../../lib/quests/quest';
import QuestGoal from '../../../lib/quests/quest-goal';
import SimpleMap from '../../../lib/util/simple-map';
import {CharacterDeathblowEvent} from '../../../lib/characters/character-events';
import {QuestProgressEvent} from '../../../lib/quests/quest-events';

/**
 * A quest goal requiring the player kill a certain target a certain number of times
 */
export class KillGoal extends QuestGoal {
    public constructor(quest: Quest, cfg: SimpleMap, player: Player) {
        const config = {
            title: 'Kill Enemy',
            npc: null,
            count: 1,
            ...cfg,
        };

        super(quest, config, player);

        this.state = {count: 0};

        this.listen(new CharacterDeathblowEvent().getName(), this.targetKilled.bind(this));
    }

    public getProgress(): QuestProgress {
        const percent = (this.state.count / this.config.count) * 100;
        const display = `${this.config.title}: [${this.state.count}/${this.config.count}]`;

        return {percent, display};
    }

    private targetKilled(target: Character): void {
        if (target.entityReference !== this.config.npc || this.state.count > this.config.count) {
            return;
        }

        this.state.count += 1;

        this.dispatch(new QuestProgressEvent({progress: this.getProgress()}));
    }
}

export default KillGoal;
