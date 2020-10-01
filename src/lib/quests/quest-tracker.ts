import QuestStartedEvent from './events/quest-started-event';

import type GameStateData from '../game-state-data';
import type Player from '../players/player';
import type {Quest, SerializedQuest} from './quest';
import type Serializable from '../data/serializable';
import type SimpleMap from '../util/simple-map';

export interface SerializedQuestTracker extends SimpleMap {
    active: {[key: string]: SerializedQuest};
    completed: {[key: string]: SerializedQuest};
}

/**
 * Keeps track of player quest progress
 */
export class QuestTracker implements Serializable {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    private readonly _activeQuests: Map<string, Quest> = new Map<string, Quest>();
    private readonly _completedQuests: Map<string, Quest> = new Map<string, Quest>();
    private readonly _player: Player;
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    public constructor(player: Player, active: unknown[] = [], completed: unknown[] = []) {
        this._player = player;

        /*
         * this.activeQuests = new Map(active);
         * this.completedQuests = new Map(completed);
         */
    }

    public get active(): Map<string, Quest> {
        return this._activeQuests;
    }

    public get completed(): Map<string, Quest> {
        return this._completedQuests;
    }

    public complete(qid: string): void {
        if (!this.isActive(qid)) {
            throw new Error('Quest not started');
        }

        const quest = this.get(qid);

        quest!.completedAt = new Date().toJSON();

        this._completedQuests.set(qid, quest!);
        this._activeQuests.delete(qid);
    }

    /**
     * Proxy events to all active quests
     */
    /*
     * public emit(event: string | symbol, ...args: any[]): boolean {
     *     for (const [, quest] of this._activeQuests) {
     *         quest.emit(event, ...args);
     *     }
     *
     *     return true;
     * }
     */

    public get(qid: string): Quest | null {
        return this._activeQuests.get(qid) ?? null;
    }

    public hydrate(state: GameStateData): void {
        for (const [qid, data] of this._activeQuests) {
            const quest = state.questFactory.create(state, qid, this._player, data.state);

            quest.started = data.started;
            quest.hydrate();

            this._activeQuests.set(qid, quest);
        }
    }

    public isActive(qid: string): boolean {
        return this._activeQuests.has(qid);
    }

    public isComplete(qid: string): boolean {
        return this._completedQuests.has(qid);
    }

    public serialize(): SerializedQuestTracker {
        return {
            completed: [...this._completedQuests]
                .map(([qid, quest]: [string, Quest]) => [qid, quest.serialize()])
                .reduce(
                    (
                        acc: {[key: string]: SerializedQuest},
                        [qid, quest]: [string, SerializedQuest]
                    ) => ({...acc, [`${qid}`]: quest}),
                    {}
                ),

            active: [...this._activeQuests]
                .map(([qid, quest]: [string, Quest]) => [qid, quest.serialize()])
                .reduce(
                    (
                        acc: {[key: string]: SerializedQuest},
                        [qid, quest]: [string, SerializedQuest]
                    ) => ({...acc, [`${qid}`]: quest}),
                    {}
                ),
        };
    }

    public start(quest: Quest): void {
        const qid = quest.entityReference;

        if (this._activeQuests.has(qid)) {
            throw new Error('Quest already started');
        }

        quest.started = new Date().toJSON();
        this._activeQuests.set(qid, quest);
        quest.dispatch(new QuestStartedEvent());
    }
}

export default QuestTracker;
