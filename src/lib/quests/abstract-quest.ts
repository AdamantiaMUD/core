import type {QuestDefinition} from './quest';

export interface AbstractQuest {
    area: string;
    config: QuestDefinition;
    id: string;
    npc?: string;
}

export default AbstractQuest;
