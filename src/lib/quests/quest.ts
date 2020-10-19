import MudEventEmitter from '../events/mud-event-emitter';
import {
    QuestCompletedEvent,
    QuestProgressEvent,
    QuestTurnInReadyEvent,
} from './events';
import {clone} from '../util/objects';

import type GameStateData from '../game-state-data';
import type Player from '../players/player';
import type Serializable from '../data/serializable';
import type SimpleMap from '../util/simple-map';
import type QuestDefinition from './quest-definition';
import type QuestGoal from './quest-goal';
import type QuestProgress from './quest-progress';
import type SerializedQuest from './serialized-quest';
import type SerializedQuestGoal from './serialized-quest-goal';
import type {QuestProgressPayload} from './events';

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
    public state: SimpleMap[] = [];
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
        goal.listen<QuestProgressPayload>(QuestProgressEvent.getName(), this.onProgressUpdated.bind(this));
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
            display: overallDisplay.join('\r\n'),
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
            }
            else {
                this.dispatch(new QuestTurnInReadyEvent());
            }

            return;
        }

        this.dispatch(new QuestProgressEvent({progress}));
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
