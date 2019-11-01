import ItemType from '../equipment/item-type';
import {ItemDefinition} from '../equipment/item';
import {Npc} from '../mobs/npc';

export const makeCorpse = (npc: Npc): ItemDefinition => ({
    id: 'corpse',
    name: `Corpse of ${npc.name}`,
    roomDesc: npc.corpseDesc ? npc.corpseDesc : `Corpse of ${npc.name}`,
    description: `The rotting corpse of ${npc.name}`,
    keywords: npc.keywords.concat(['corpse']),
    type: ItemType.CONTAINER,
    metadata: {
        noPickup: true,
    },
    maxItems: 0,
    behaviors: {
        decay: {
            duration: 180,
        },
    },
});
