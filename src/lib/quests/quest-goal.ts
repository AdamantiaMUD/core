import EventEmitter from 'events';
import cloneFactory from 'rfdc';

import Player from '../players/player';
import Quest from './quest';
import Serializable from '../data/serializable';
import SimpleMap from '../util/simple-map';

const clone = cloneFactory();

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
export class QuestGoal extends EventEmitter implements Serializable {
    public config: SimpleMap;
    public player: Player;
    public quest: Quest;
    public state: SimpleMap = {};

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
    /* eslint-disable-next-line no-empty-function */
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
