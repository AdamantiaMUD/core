import MudEventEmitter from '../events/mud-event-emitter.js';
import {
    QuestCompletedEvent,
    QuestProgressEvent,
    QuestTurnInReadyEvent,
} from './events/index.js';
import { clone } from '../util/objects.js';

import type GameStateData from '../game-state-data.js';
import type Player from '../players/player.js';
import type Serializable from '../data/serializable.js';
import type QuestDefinition from './quest-definition.js';
import type QuestGoal from './quest-goal.js';
import type QuestProgress from './quest-progress.js';
import type SerializedQuest from './serialized-quest.js';
import type SerializedQuestGoal from './serialized-quest-goal.js';
import type { QuestProgressPayload } from './events/index.js';

export class Quest extends MudEventEmitter implements Serializable {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public GameState: GameStateData;
    public completedAt: string = '';
    public config: QuestDefinition;
    public id: string;
    public entityReference: string;
    public goals: QuestGoal[] = [];
    public player: Player;
    public started: string = '';
    public state: SerializedQuestGoal[] = [];
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    public constructor(
        state: GameStateData,
        id: string,
        config: QuestDefinition,
        player: Player
    ) {
        super();

        this.id = id;
        this.entityReference = config.entityReference ?? id;
        this.config = {
            completionMessage: null,
            requires: [],
            level: 1,
            ...clone(config),
        };

        this.player = player;
        this.GameState = state;
    }

    public addGoal(goal: QuestGoal): void {
        this.goals.push(goal);
        goal.listen<Quest, QuestProgressPayload>(
            QuestProgressEvent.getName(),
            this.onProgressUpdated.bind(this)
        );
    }

    public complete(): void {
        this.dispatch(new QuestCompletedEvent());

        for (const goal of this.goals) {
            goal.complete();
        }
    }

    /**
     * Proxy all events to all the goals
     */
    /*
     * public emit(event: string | symbol, ...args: any[]): boolean {
     *     super.emit(event, ...args);
     *
     *     if (event === 'progress') {
     *         // don't proxy progress event
     *         return false;
     *     }
     *
     *     this.goals.forEach(goal => {
     *         goal.emit(event, ...args);
     *     });
     *
     *     return true;
     * }
     */

    public getProgress(): QuestProgress {
        let overallPercent = 0;
        const overallDisplay: string[] = [];

        this.goals.forEach((goal: QuestGoal) => {
            const goalProgress = goal.getProgress();

            overallPercent += goalProgress.percent;
            overallDisplay.push(goalProgress.display);
        });

        return {
            percent: Math.round(overallPercent / this.goals.length),
            display: overallDisplay.join('\n'),
        };
    }

    public hydrate(): void {
        this.state.forEach((goalState: SerializedQuestGoal, i: number) => {
            this.goals[i].hydrate(goalState.state);
        });
    }

    public onProgressUpdated(): void {
        const progress = this.getProgress();

        if (progress.percent >= 100) {
            if (this.config.autoComplete) {
                this.complete();
            } else {
                this.dispatch(new QuestTurnInReadyEvent());
            }

            return;
        }

        this.dispatch(new QuestProgressEvent({ progress }));
    }

    /**
     * Save the current state of the quest on player save
     */
    public serialize(): SerializedQuest {
        return {
            state: this.goals.map((goal: QuestGoal) => goal.serialize()),
            progress: this.getProgress(),
            config: {
                desc: this.config.description,
                level: this.config.level ?? 1,
                title: this.config.title,
            },
        };
    }

    public setStartTime(started: string): void {
        this.started = started;
    }
}

export default Quest;
