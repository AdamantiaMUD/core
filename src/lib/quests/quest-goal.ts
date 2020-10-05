import MudEventEmitter from '../events/mud-event-emitter';
import {clone} from '../util/objects';

import type Player from '../players/player';
import type Quest from './quest';
import type Serializable from '../data/serializable';
import type SimpleMap from '../util/simple-map';

export interface QuestGoalDefinition {
    config: SimpleMap;
    type: string;
}

export interface SerializedQuestGoal extends SimpleMap {
    config: SimpleMap;
    state: SimpleMap;
}

/**
 * Representation of a goal of a quest.
 * The {@link http://ranviermud.com/extending/areas/quests/|Quest guide} has instructions on to
 * create new quest goals for quests
 * @extends EventEmitter
 */
export class QuestGoal extends MudEventEmitter implements Serializable {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public config: SimpleMap;
    public player: Player;
    public quest: Quest;
    public state: SimpleMap = {};
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    public constructor(quest: Quest, config: SimpleMap, player: Player) {
        super();

        // no defaults currently
        this.config = clone(config);
        this.quest = quest;
        this.player = player;
    }

    /**
     * Put any cleanup activities after the quest is finished here
     */
    /* eslint-disable-next-line @typescript-eslint/no-empty-function */
    public complete(): void {}

    public getProgress(): {percent: number; display: string} {
        return {
            percent: 0,
            /* eslint-disable-next-line max-len */
            display: '[WARNING] Quest does not have progress display configured. Please tell an admin',
        };
    }

    public hydrate(state: SimpleMap): void {
        this.state = state;
    }

    public serialize(): SerializedQuestGoal {
        return {
            state: this.state,
            config: this.config,
        };
    }
}

export default QuestGoal;
