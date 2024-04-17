import type Character from '../characters/character.js';
import type ItemDefinition from '../equipment/item-definition.js';
import ItemType from '../equipment/item-type.js';
import type Npc from '../mobs/npc.js';

import { isNpc } from './characters.js';
import { hasValue } from './functions.js';

export const DEFAULT_WEAPON_SPEED = 2;

export const getWeaponDamage = (
    character: Character
): { max: number; min: number } => {
    const weapon = character.equipment.get('wield');

    if (hasValue(weapon)) {
        return {
            max: weapon.getMeta<number>('maxDamage') ?? 0,
            min: weapon.getMeta<number>('minDamage') ?? 0,
        };
    }

    return { max: 0, min: 0 };
};

export const getWeaponSpeed = (character: Character): number => {
    const weapon = character.equipment.get('wield');

    if (hasValue(weapon) && !isNpc(character)) {
        return weapon.getMeta<number>('speed') ?? DEFAULT_WEAPON_SPEED;
    }

    return DEFAULT_WEAPON_SPEED;
};

export const makeCorpse = (npc: Npc): ItemDefinition => ({
    id: 'corpse',
    name: `Corpse of ${npc.name}`,
    roomDesc: npc.corpseDesc ?? `Corpse of ${npc.name}`,
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
