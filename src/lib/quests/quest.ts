import EventEmitter from 'events';
import cloneFactory from 'rfdc';

import GameState from '../game-state';
import Player from '../players/player';
import QuestGoal, {
    QuestGoalDefinition,
    SerializedQuestGoal
} from './quest-goal';
import Serializable from '../data/serializable';
import SimpleMap from '../util/simple-map';
import {QuestRewardDefinition} from './quest-reward';

const clone = cloneFactory();

export interface QuestDefinition {
    autoComplete: boolean;
    completionMessage?: string;
    description?: string;
    entityReference?: string;
    goals: QuestGoalDefinition[];
    id: string;
    level?: number;
    npc?: string;
    repeatable: boolean;
    requires?: string[];
    rewards: QuestRewardDefinition[];
    title: string;
}

export interface SerializedQuest extends SimpleMap {
    config: {desc: string; level: number; title: string};
    progress: {percent: number; display: string};
    state: SerializedQuestGoal[];
}

export class Quest extends EventEmitter implements Serializable {
    /* eslint-disable lines-between-class-members */
    public GameState: GameState;
    public completedAt: string = '';
    public config: QuestDefinition;
    public id: string;
    public entityReference: string;
    public goals: QuestGoal[] = [];
    public player: Player;
    public started: string = '';
    public state: SimpleMap[] = [];
    /* eslint-enable lines-between-class-members */

    public constructor(
        state: GameState,
        id: string,
        config: QuestDefinition,
        player: Player
    ) {
        super();

        this.id = id;
        this.entityReference = config.entityReference;
        this.config = {
            title: 'Missing Quest Title',
            description: 'Missing Quest Description',
            completionMessage: null,
            requires: [],
            level: 1,
            autoComplete: false,
            repeatable: false,
            rewards: [],
            goals: [],
            ...clone(config),
        };

        this.player = player;
        this.GameState = state;
    }

    public addGoal(goal): void {
        this.goals.push(goal);
        goal.on('progress', () => this.onProgressUpdated());
    }

    /**
     * @fires Quest#complete
     */
    public complete(): void {
        /**
         * @event Quest#complete
         */
        this.emit('complete');
        for (const goal of this.goals) {
            goal.complete();
        }
    }

    /**
     * Proxy all events to all the goals
     */
    public emit(event: string | symbol, ...args: any[]): boolean {
        super.emit(event, ...args);

        if (event === 'progress') {
            // don't proxy progress event
            return false;
        }

        this.goals.forEach(goal => {
            goal.emit(event, ...args);
        });

        return true;
    }

    public getProgress(): {percent: number; display: string} {
        let overallPercent = 0;
        const overallDisplay = [];

        this.goals.forEach(goal => {
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
        this.state.forEach((goalState, i) => {
            this.goals[i].hydrate(goalState.state);
        });
    }

    /**
     * @fires Quest#turn-in-ready
     * @fires Quest#progress
     */
    public onProgressUpdated(): void {
        const progress = this.getProgress();

        if (progress.percent >= 100) {
            if (this.config.autoComplete) {
                this.complete();
            }
            else {
                /**
                 * @event Quest#turn-in-ready
                 */
                this.emit('turn-in-ready');
            }

            return;
        }

        /**
         * @event Quest#progress
         * @param {object} progress
         */
        this.emit('progress', progress);
    }

    /**
     * Save the current state of the quest on player save
     */
    public serialize(): SerializedQuest {
        return {
            state: this.goals.map(goal => goal.serialize()),
            progress: this.getProgress(),
            config: {
                desc: this.config.description,
                level: this.config.level,
                title: this.config.title,
            },
        };
    }
}

export default Quest;
