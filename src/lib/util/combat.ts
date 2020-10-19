import ItemType from '../equipment/item-type';
import {isNpc} from './characters';
import {hasValue} from './functions';

import type CharacterInterface from '../characters/character-interface';
import type ItemDefinition from '../equipment/item-definition';
import type Npc from '../mobs/npc';

export const DEFAULT_WEAPON_SPEED = 2;

export const getWeaponDamage = (character: CharacterInterface): {max: number; min: number} => {
    const weapon = character.equipment.get('wield');

    if (hasValue(weapon)) {
        return {
            max: weapon.getMeta<number>('maxDamage') ?? 0,
            min: weapon.getMeta<number>('minDamage') ?? 0,
        };
    }

    return {max: 0, min: 0};
};

export const getWeaponSpeed = (character: CharacterInterface): number => {
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
