import QuestGoal from '../../../../lib/quests/quest-goal.js';
import { CharacterDeathblowEvent } from '../../../../lib/characters/events/index.js';
import { QuestProgressEvent } from '../../../../lib/quests/events/index.js';

import type Character from '../../../../lib/characters/character.js';
import type Player from '../../../../lib/players/player.js';
import type Quest from '../../../../lib/quests/quest.js';
import type QuestProgress from '../../../../lib/quests/quest-progress.js';
import type SimpleMap from '../../../../lib/util/simple-map.js';

interface KillGoalConfig extends SimpleMap {
    title: string;
    npc: string | null;
    count: number;
}

interface KillGoalState extends SimpleMap {
    count: number;
}

/**
 * A quest goal requiring the player kill a certain target a certain number of times
 */
export class KillGoal extends QuestGoal<KillGoalConfig, KillGoalState> {
    public constructor(quest: Quest, config: KillGoalConfig, player: Player) {
        super(quest, config, player);

        this.state = { count: 0 };

        this.listen(
            CharacterDeathblowEvent.getName(),
            this._targetKilled.bind(this)
        );
    }

    public getProgress(): QuestProgress {
        const percent = (this.state.count / this.config.count) * 100;
        const display = `${this.config.title}: [${this.state.count}/${this.config.count}]`;

        return { percent, display };
    }

    private _targetKilled(target: Character): void {
        if (
            target.entityReference !== this.config.npc ||
            this.state.count > this.config.count
        ) {
            return;
        }

        this.state.count += 1;

        this.dispatch(new QuestProgressEvent({ progress: this.getProgress() }));
    }
}

export default KillGoal;
