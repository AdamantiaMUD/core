import type QuestGoal from '../quests/quest-goal';

export interface QuestGoalModule {
    default: typeof QuestGoal;
}

export default QuestGoalModule;
