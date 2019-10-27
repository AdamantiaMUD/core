import GameState from '../game-state';
import Logger from '../util/logger';
import Player from '../players/player';
import Quest, {QuestDefinition} from './quest';
import SimpleMap from '../util/simple-map';

interface AbstractQuest {
    area: string;
    config: QuestDefinition;
    id: string;
    npc?: string;
}

export class QuestFactory {
    private readonly _quests: Map<string, AbstractQuest> = new Map();

    public add(ref: string, areaName: string, id: string, config: QuestDefinition): void {
        config.entityReference = ref;
        this._quests.set(ref, {id: id, area: areaName, config: config});
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

        if (tracker.completed.has(questRef) && !quest.config.repeatable) {
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
        const quest = this._quests.get(qid);

        if (!quest) {
            throw new Error(`Trying to create invalid quest id [${qid}]`);
        }

        const instance = new Quest(state, quest.id, quest.config, player);

        instance.state = questState;

        for (const goal of quest.config.goals) {
            const GoalType = state.questGoalManager.get(goal.type);

            instance.addGoal(new GoalType(instance, goal.config, player));
        }

        instance.on('progress', progress => {
            player.emit('quest-progress', instance, progress);
            player.save();
        });

        instance.on('start', () => {
            player.emit('quest-start', instance);
            instance.emit('progress', instance.getProgress());
        });

        instance.on('turn-in-ready', () => {
            player.emit('quest-turn-in-ready', instance);
        });

        instance.on('complete', () => {
            player.emit('quest-complete', instance);
            player.questTracker.complete(instance.entityReference);

            if (!quest.config.rewards) {
                player.save();

                return;
            }

            for (const reward of quest.config.rewards) {
                try {
                    const rewardClass = state.questRewardManager.get(reward.type);

                    if (!rewardClass) {
                        throw new Error(`Quest [${qid}] has invalid reward type ${reward.type}`);
                    }

                    rewardClass.reward(state, instance, reward.config, player);
                    player.emit('quest-reward', reward);
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
        return this._quests.get(qid);
    }

    public set(qid: string, val: AbstractQuest): void {
        this._quests.set(qid, val);
    }
}

export default QuestFactory;
