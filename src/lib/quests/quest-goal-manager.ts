import type QuestGoal from './quest-goal.js';

/**
 * Simple map of quest goal name => class definition
 */
export class QuestGoalManager extends Map<string, typeof QuestGoal> {}

export default QuestGoalManager;
