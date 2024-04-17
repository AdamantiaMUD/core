import type Serializable from '../data/serializable.js';
import MudEventEmitter from '../events/mud-event-emitter.js';
import type Player from '../players/player.js';
import { cast } from '../util/functions.js';
import { clone } from '../util/objects.js';
import type SimpleMap from '../util/simple-map.js';

import type Quest from './quest.js';
import type SerializedQuestGoal from './serialized-quest-goal.js';

/**
 * Representation of a goal of a quest.
 * The {@link http://ranviermud.com/extending/areas/quests/|Quest guide} has instructions on to
 * create new quest goals for quests
 * @extends EventEmitter
 */
export class QuestGoal<
        QuestConfig extends SimpleMap = SimpleMap,
        QuestState extends SimpleMap = SimpleMap,
    >
    extends MudEventEmitter
    implements Serializable
{
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public config: QuestConfig;
    public player: Player;
    public quest: Quest;
    public state: QuestState = cast<QuestState>({});
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    public constructor(quest: Quest, config: QuestConfig, player: Player) {
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

    public getProgress(): { percent: number; display: string } {
        return {
            percent: 0,
            display:
                '[WARNING] Quest does not have progress display configured. Please tell an admin',
        };
    }

    public hydrate(state: QuestState): void {
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
