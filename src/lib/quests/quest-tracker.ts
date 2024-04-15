import QuestStartedEvent from './events/quest-started-event.js';

import type GameStateData from '../game-state-data.js';
import type Player from '../players/player.js';
import type Quest from './quest.js';
import type Serializable from '../data/serializable.js';
import type SerializedQuest from './serialized-quest.js';
import type SerializedQuestTracker from './serialized-quest-tracker.js';
import type SimpleMap from '../util/simple-map.js';

/**
 * Keeps track of player quest progress
 */
export class QuestTracker implements Serializable {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    private readonly _activeQuests: Map<string, Quest> = new Map<string, Quest>();
    private readonly _completedQuests: Map<string, Quest> = new Map<string, Quest>();
    private readonly _player: Player;
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    public constructor(player: Player) {
        this._player = player;
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
            active: [...this._activeQuests]
                .map<[string, SerializedQuest]>(([qid, quest]: [string, Quest]) => [qid, quest.serialize()])
                .reduce<SimpleMap<SerializedQuest>>(
                    (
                        acc: SimpleMap<SerializedQuest>,
                        [qid, quest]: [string, SerializedQuest]
                    ) => ({...acc, [`${qid}`]: quest}),
                    {}
                ),

            completed: [...this._completedQuests]
                .map<[string, SerializedQuest]>(([qid, quest]: [string, Quest]) => [qid, quest.serialize()])
                .reduce<SimpleMap<SerializedQuest>>(
                    (
                        acc: SimpleMap<SerializedQuest>,
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

        quest.setStartTime(new Date().toJSON());
        this._activeQuests.set(qid, quest);
        quest.dispatch(new QuestStartedEvent());
    }
}

export default QuestTracker;
