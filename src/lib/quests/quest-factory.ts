import produce from 'immer';

import type {Draft} from 'immer';

import Logger from '../common/logger';
import Quest from './quest';
import {
    PlayerQuestCompletedEvent,
    PlayerQuestProgressEvent,
    PlayerQuestStartedEvent,
    PlayerQuestTurnInReadyEvent,
} from '../players/events';
import {
    QuestCompletedEvent,
    QuestProgressEvent,
    QuestRewardEvent,
    QuestStartedEvent,
    QuestTurnInReadyEvent,
} from './events';
import {hasValue} from '../util/functions';

import type AbstractQuest from './abstract-quest';
import type GameStateData from '../game-state-data';
import type Player from '../players/player';
import type QuestDefinition from './quest-definition';
import type SerializedQuestGoal from './serialized-quest-goal';
import type {QuestProgressPayload} from './events';

export class QuestFactory {
    private readonly _quests: Map<string, AbstractQuest> = new Map<string, AbstractQuest>();

    public add(ref: string, areaName: string, id: string, config: QuestDefinition): void {
        const cfg = produce(config, (draft: Draft<QuestDefinition>) => {
            draft.entityReference = ref;
        });

        this._quests.set(ref, {id: id, area: areaName, config: cfg});
    }

    /**
     * Check to see if a player can start a given quest based on the quest's
     * prerequisite quests
     */
    public canStart(player: Player, questRef: string): boolean {
        const quest = this.get(questRef);

        if (!hasValue(quest)) {
            throw new Error(`Invalid quest id [${questRef}]`);
        }

        const tracker = player.questTracker;

        if (tracker.completed.has(questRef) && !quest.config.repeatable) {
            return false;
        }

        if (tracker.isActive(questRef)) {
            return false;
        }

        if (!Array.isArray(quest.config.requires)) {
            return true;
        }

        return quest.config.requires
            .every((requiresRef: string) => tracker.isComplete(requiresRef));
    }

    public create(
        state: GameStateData,
        qid: string,
        player: Player,
        questState: SerializedQuestGoal[] = []
    ): Quest {
        const questData = this._quests.get(qid);

        if (!hasValue(questData)) {
            throw new Error(`Trying to create invalid quest id [${qid}]`);
        }

        const quest = new Quest(state, questData.id, questData.config, player);

        quest.state = questState;

        for (const goal of questData.config.goals) {
            const GoalType = state.questGoalManager.get(goal.type);

            if (hasValue(GoalType)) {
                quest.addGoal(new GoalType(quest, goal.config, player));
            }
            else {
                // @TODO: error
            }
        }

        quest.listen<Quest, QuestProgressPayload>(
            QuestProgressEvent.getName(),
            (qst: Quest, {progress}: QuestProgressPayload) => {
                player.dispatch(new PlayerQuestProgressEvent({progress: progress, quest: qst}));
                player.save();
            }
        );

        quest.listen(QuestStartedEvent.getName(), (qst: Quest) => {
            player.dispatch(new PlayerQuestStartedEvent({quest: qst}));
            qst.dispatch(new QuestProgressEvent({progress: qst.getProgress()}));
        });

        quest.listen(QuestTurnInReadyEvent.getName(), (qst: Quest) => {
            player.dispatch(new PlayerQuestTurnInReadyEvent({quest: qst}));
        });

        quest.listen(QuestCompletedEvent.getName(), (qst: Quest) => {
            player.dispatch(new PlayerQuestCompletedEvent({quest: qst}));
            player.questTracker.complete(qst.entityReference);

            if (!hasValue(questData.config.rewards) || questData.config.rewards.length === 0) {
                player.save();

                return;
            }

            for (const reward of questData.config.rewards) {
                const rewardClass = state.questRewardManager.get(reward.type);

                if (hasValue(rewardClass)) {
                    rewardClass.reward(state, qst, player, reward.config);
                    player.dispatch(new QuestRewardEvent({reward}));
                }
                else {
                    Logger.error(`Quest [${qid}] has invalid reward type ${reward.type}`);
                }
            }

            player.save();
        });

        return quest;
    }

    /**
     * Get a quest definition. Use `create` if you want an instance of a quest
     */
    public get(qid: string): AbstractQuest | null {
        return this._quests.get(qid) ?? null;
    }

    public set(qid: string, val: AbstractQuest): void {
        this._quests.set(qid, val);
    }
}

export default QuestFactory;
