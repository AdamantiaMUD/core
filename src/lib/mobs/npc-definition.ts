import type SimpleMap from '../util/simple-map';

export interface NpcDefinition {
    attributes?: SimpleMap;
    behaviors?: {[key: string]: SimpleMap};
    corpseDesc?: string;
    defaultEquipment?: {[key: string]: string};
    description: string;
    entityReference: string;
    id: string;
    items?: string[];
    keywords: string[];
    level: number;
    metadata?: SimpleMap;
    name: string;
    quests?: string[];
    roomDesc?: string;
    script?: string;
    shortName?: string;
    type?: string;
    uuid?: string;
}

export default NpcDefinition;
