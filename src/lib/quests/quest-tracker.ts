import GameState from '../game-state';
import Player from '../players/player';
import Quest, {SerializedQuest} from './quest';
import Serializable from '../data/serializable';
import SimpleMap from '../util/simple-map';
import {QuestStartedEvent} from './quest-events';

export interface SerializedQuestTracker extends SimpleMap {
    active: {[key: string]: SerializedQuest};
    completed: {[key: string]: SerializedQuest};
}

/**
 * Keeps track of player quest progress
 */
export class QuestTracker implements Serializable {
    private readonly _activeQuests: Map<string, Quest> = new Map();
    private readonly _completedQuests: Map<string, Quest> = new Map();
    private readonly _player: Player;

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

        quest.completedAt = new Date().toJSON();

        this._completedQuests.set(qid, quest);
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

    public get(qid: string): Quest {
        return this._activeQuests.get(qid);
    }

    public hydrate(state: GameState): void {
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
                .map(([qid, quest]) => [qid, quest.serialize()])
                .reduce((acc, [qid, quest]) => ({...acc, [`${qid}`]: quest}), {}),
            active: [...this._activeQuests]
                .map(([qid, quest]) => [qid, quest.serialize()])
                .reduce((acc, [qid, quest]) => ({...acc, [`${qid}`]: quest}), {}),
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
