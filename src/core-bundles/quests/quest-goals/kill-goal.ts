import Character from '../../../lib/entities/character';
import Player from '../../../lib/players/player';
import Quest from '../../../lib/quests/quest';
import QuestGoal from '../../../lib/quests/quest-goal';
import {SimpleMap} from '../../../../index';

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

        this.on('deathblow', this.targetKilled);
    }

    public getProgress(): {percent: number; display: string} {
        const percent = (this.state.count / this.config.count) * 100;
        const display = `${this.config.title}: [${this.state.count}/${this.config.count}]`;

        return {percent, display};
    }

    private targetKilled(target: Character): void {
        if (target.entityReference !== this.config.npc || this.state.count > this.config.count) {
            return;
        }

        this.state.count += 1;

        this.emit('progress', this.getProgress());
    }
}

export default KillGoal;
