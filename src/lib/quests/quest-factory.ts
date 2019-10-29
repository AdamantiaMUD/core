import GameState from '../game-state';
import Logger from '../util/logger';
import Player from '../players/player';
import Quest, {QuestDefinition} from './quest';
import SimpleMap from '../util/simple-map';
import {
    PlayerQuestCompletedEvent,
    PlayerQuestProgressEvent,
    PlayerQuestStartedEvent,
    PlayerQuestTurnInReadyEvent,
} from '../players/player-events';
import {
    QuestCompletedEvent,
    QuestProgressEvent,
    QuestProgressPayload,
    QuestRewardEvent,
    QuestStartedEvent,
    QuestTurnInReadyEvent,
} from './quest-events';

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
        const questData = this._quests.get(qid);

        if (!questData) {
            throw new Error(`Trying to create invalid quest id [${qid}]`);
        }

        const quest = new Quest(state, questData.id, questData.config, player);

        quest.state = questState;

        for (const goal of questData.config.goals) {
            const GoalType = state.questGoalManager.get(goal.type);

            quest.addGoal(new GoalType(quest, goal.config, player));
        }

        quest.listen<QuestProgressPayload>(QuestProgressEvent.getName(), (qst: Quest, {progress}) => {
            player.dispatch(new PlayerQuestProgressEvent({progress: progress, quest: qst}));
            player.save();
        });

        quest.listen<{}>(QuestStartedEvent.getName(), (qst: Quest) => {
            player.dispatch(new PlayerQuestStartedEvent({quest: qst}));
            qst.dispatch(new QuestProgressEvent({progress: qst.getProgress()}));
        });

        quest.listen<{}>(QuestTurnInReadyEvent.getName(), (qst: Quest) => {
            player.dispatch(new PlayerQuestTurnInReadyEvent({quest: qst}));
        });

        quest.listen<{}>(QuestCompletedEvent.getName(), (qst: Quest) => {
            player.dispatch(new PlayerQuestCompletedEvent({quest: qst}));
            player.questTracker.complete(qst.entityReference);

            if (!questData.config.rewards) {
                player.save();

                return;
            }

            for (const reward of questData.config.rewards) {
                try {
                    const rewardClass = state.questRewardManager.get(reward.type);

                    if (!rewardClass) {
                        throw new Error(`Quest [${qid}] has invalid reward type ${reward.type}`);
                    }

                    rewardClass.reward(state, qst, reward.config, player);
                    player.dispatch(new QuestRewardEvent({reward}));
                }
                catch (e) {
                    Logger.error(e.message);
                }
            }

            player.save();
        });

        return quest;
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
