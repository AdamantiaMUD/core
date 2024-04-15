import type QuestGoal from '../quests/quest-goal.js';

export interface QuestGoalModule {
    default: typeof QuestGoal;
}

export default QuestGoalModule;
