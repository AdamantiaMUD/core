import type QuestGoalDefinition from './quest-goal-definition';
import type QuestRewardDefinition from './quest-reward-definition';

export interface QuestDefinition {
    autoComplete: boolean;
    completionMessage?: string | null;
    description: string;
    entityReference?: string;
    goals: QuestGoalDefinition[];
    id: string;
    level?: number;
    npc?: string;
    repeatable: boolean;
    requires?: string[];
    rewards: QuestRewardDefinition[];
    title: string;
}

export default QuestDefinition;
