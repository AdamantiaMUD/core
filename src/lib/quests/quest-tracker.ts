import GameState from '../game-state';
import Player from '../players/player';
import Quest from './quest';
import Serializable from '../data/serializable';

/**
 * Keeps track of player quest progress
 */
export class QuestTracker implements Serializable {
    /* eslint-disable lines-between-class-members */
    public activeQuests: Map<string, Quest>;
    public completedQuests: Map<string, Quest>;
    public player: Player;
    /* eslint-enable lines-between-class-members */

    public constructor(player: Player, active: any[] = [], completed: any[] = []) {
        this.player = player;

        this.activeQuests = new Map(active);
        this.completedQuests = new Map(completed);
    }

    public complete(qid: string): void {
        if (!this.isActive(qid)) {
            throw new Error('Quest not started');
        }

        const quest = this.get(qid);

        quest.completedAt = (new Date()).toJSON();

        this.completedQuests.set(qid, quest);
        this.activeQuests.delete(qid);
    }

    /**
     * Proxy events to all active quests
     */
    public emit(event: string | symbol, ...args: any[]): boolean {
        for (const [, quest] of this.activeQuests) {
            quest.emit(event, ...args);
        }

        return true;
    }

    public get(qid: string): Quest {
        return this.activeQuests.get(qid);
    }

    public hydrate(state: GameState): void {
        for (const [qid, data] of this.activeQuests) {
            const quest = state.QuestFactory.create(state, qid, this.player, data.state);

            quest.started = data.started;
            quest.hydrate();

            this.activeQuests.set(qid, quest);
        }
    }

    public isActive(qid: string): boolean {
        return this.activeQuests.has(qid);
    }

    public isComplete(qid: string): boolean {
        return this.completedQuests.has(qid);
    }

    public serialize(): SerializedQuestTracker {
        return {
            completed: [...this.completedQuests]
                .map(([qid, quest]) => [qid, quest.serialize()])
                .reduce((acc, [qid, quest]) => ({...acc, [`${qid}`]: quest}), {}),
            active: [...this.activeQuests]
                .map(([qid, quest]) => [qid, quest.serialize()])
                .reduce((acc, [qid, quest]) => ({...acc, [`${qid}`]: quest}), {}),
        };
    }

    public start(quest: Quest): void {
        const qid = quest.entityReference;

        if (this.activeQuests.has(qid)) {
            throw new Error('Quest already started');
        }

        quest.started = (new Date()).toJSON();
        this.activeQuests.set(qid, quest);
        quest.emit('start');
    }
}

export default QuestTracker;
