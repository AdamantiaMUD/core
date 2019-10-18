import GameState from '../GameState';
import Logger from '../Logger';
import Player from '../Player';
import Quest from './Quest';
import QuestDefinition from '../interfaces/QuestDefinition';
import SimpleMap from '../interfaces/SimpleMap';

interface AbstractQuest {
    area: string;
    config: QuestDefinition;
    id: string;
    npc?: string;
}

/**
 * @property {Map} quests
 */
export class QuestFactory {
    /* eslint-disable lines-between-class-members */
    public quests: Map<string, AbstractQuest> = new Map();
    /* eslint-enable lines-between-class-members */

    public add(areaName: string, id: string, config: QuestDefinition): void {
        const entityRef = this.makeQuestKey(areaName, id);

        config.entityReference = entityRef;
        this.quests.set(entityRef, {id: id, area: areaName, config: config});
    }

    /**
     * Check to see if a player can start a given quest based on the quest's
     * prerequisite quests
     */
    public canStart(player: Player, questRef: string): boolean {
        const quest = this.get(questRef);

        if (!quest) {
            throw new Error(`Invalid quest id [${questRef}]`);
        }

        const tracker = player.questTracker;

        if (tracker.completedQuests.has(questRef) && !quest.config.repeatable) {
            return false;
        }

        if (tracker.isActive(questRef)) {
            return false;
        }

        if (!quest.config.requires) {
            return true;
        }

        return quest.config.requires.every(requiresRef => tracker.isComplete(requiresRef));
    }

    public create(
        state: GameState,
        qid: string,
        player: Player,
        questState: SimpleMap[] = []
    ): Quest {
        const quest = this.quests.get(qid);

        if (!quest) {
            throw new Error(`Trying to create invalid quest id [${qid}]`);
        }

        const instance = new Quest(state, quest.id, quest.config, player);

        instance.state = questState;

        for (const goal of quest.config.goals) {
            const GoalType = state.QuestGoalManager.get(goal.type);

            instance.addGoal(new GoalType(instance, goal.config, player));
        }

        instance.on('progress', progress => {
            player.emit('questProgress', instance, progress);
            player.save();
        });

        instance.on('start', () => {
            player.emit('questStart', instance);
            instance.emit('progress', instance.getProgress());
        });

        instance.on('turn-in-ready', () => {
            player.emit('questTurnInReady', instance);
        });

        instance.on('complete', () => {
            player.emit('questComplete', instance);
            player.questTracker.complete(instance.entityReference);

            if (!quest.config.rewards) {
                player.save();

                return;
            }

            for (const reward of quest.config.rewards) {
                try {
                    const rewardClass = state.QuestRewardManager.get(reward.type);

                    if (!rewardClass) {
                        throw new Error(`Quest [${qid}] has invalid reward type ${reward.type}`);
                    }

                    rewardClass.reward(state, instance, reward.config, player);
                    player.emit('questReward', reward);
                }
                catch (e) {
                    Logger.error(e.message);
                }
            }

            player.save();
        });

        return instance;
    }

    /**
     * Get a quest definition. Use `create` if you want an instance of a quest
     */
    public get(qid: string): AbstractQuest {
        return this.quests.get(qid);
    }

    public makeQuestKey(area: string, id: number | string): string {
        return `${area}:${id}`;
    }

    public set(qid: string, val: AbstractQuest): void {
        this.quests.set(qid, val);
    }
}

export default QuestFactory;
