import Attribute from '../attributes/attribute';
import Character from './character';
import Damage from '../combat/damage';
import Effect from '../effects/effect';
import Heal from '../combat/heal';
import Item from '../equipment/item';
import {MudEvent, MudEventConstructor} from '../events/mud-event';

export interface CharacterAttributeUpdatePayload {
    attr: string;
    value: number | Attribute;
}

export const CharacterAttributeUpdateEvent: MudEventConstructor<CharacterAttributeUpdatePayload> = class extends MudEvent<CharacterAttributeUpdatePayload> {
    public static NAME: string = 'attribute-update';
    public attr: string;
    public value: number | Attribute;
};

export interface CharacterDamagedPayload {
    amount: number;
    source: Damage;
}

export const CharacterDamagedEvent: MudEventConstructor<CharacterDamagedPayload> = class extends MudEvent<CharacterDamagedPayload> {
    public static NAME: string = 'damaged';
    public amount: number;
    public source: Damage;
};

export interface CharacterDeathblowPayload {
    skipParty?: boolean;
    target: Character;
}

export const CharacterDeathblowEvent: MudEventConstructor<CharacterDeathblowPayload> = class extends MudEvent<CharacterDeathblowPayload> {
    public static NAME: string = 'deathblow';
    public skipParty?: boolean;
    public target: Character;
};

export interface CharacterEffectAddedPayload {
    effect: Effect;
}

export const CharacterEffectAddedEvent: MudEventConstructor<CharacterEffectAddedPayload> = class extends MudEvent<CharacterEffectAddedPayload> {
    public static NAME: string = 'effect-added';
    public effect: Effect;
};

export interface CharacterEffectRemovedPayload {
    effect: Effect;
}

export const CharacterEffectRemovedEvent: MudEventConstructor<CharacterEffectRemovedPayload> = class extends MudEvent<CharacterEffectRemovedPayload> {
    public static NAME: string = 'effect-removed';
    public effect: Effect;
};

export interface CharacterEquipItemPayload {
    item: Item;
    slot: string;
}

export const CharacterEquipItemEvent: MudEventConstructor<CharacterEquipItemPayload> = class extends MudEvent<CharacterEquipItemPayload> {
    public static NAME: string = 'equip';
    public item: Item;
    public slot: string;
};

export interface CharacterFollowedTargetPayload {
    target: Character;
}

export const CharacterFollowedTargetEvent: MudEventConstructor<CharacterFollowedTargetPayload> = class extends MudEvent<CharacterFollowedTargetPayload> {
    public static NAME: string = 'followed';
    public target: Character;
};

export interface CharacterGainedFollowerPayload {
    follower: Character;
}

export const CharacterGainedFollowerEvent: MudEventConstructor<CharacterGainedFollowerPayload> = class extends MudEvent<CharacterGainedFollowerPayload> {
    public static NAME: string = 'gained-follower';
    public follower: Character;
};

export interface CharacterHealPayload {
    amount: number;
    source: Heal;
    target: Character;
}

export const CharacterHealEvent: MudEventConstructor<CharacterHealPayload> = class extends MudEvent<CharacterHealPayload> {
    public static NAME: string = 'heal';
    public amount: number;
    public source: Heal;
    public target: Character;
};

export interface CharacterHealedPayload {
    amount: number;
    source: Heal;
}

export const CharacterHealedEvent: MudEventConstructor<CharacterHealedPayload> = class extends MudEvent<CharacterHealedPayload> {
    public static NAME: string = 'healed';
    public amount: number;
    public source: Heal;
};

export interface CharacterHitPayload {
    amount: number;
    source: Damage;
    target: Character;
}

export const CharacterHitEvent: MudEventConstructor<CharacterHitPayload> = class extends MudEvent<CharacterHitPayload> {
    public static NAME: string = 'hit';
    public amount: number;
    public source: Damage;
    public target: Character;
};

export interface CharacterLostFollowerPayload {
    follower: Character;
}

export const CharacterLostFollowerEvent: MudEventConstructor<CharacterLostFollowerPayload> = class extends MudEvent<CharacterLostFollowerPayload> {
    public static NAME: string = 'lost-follower';
    public follower: Character;
};

export interface CharacterPutItemPayload {
    container: Item;
    item: Item;
}

export const CharacterPutItemEvent: MudEventConstructor<CharacterPutItemPayload> = class extends MudEvent<CharacterPutItemPayload> {
    public static NAME: string = 'put';
    public container: Item;
    public item: Item;
};

export interface CharacterUnequipItemPayload {
    item: Item;
    slot: string;
}

export const CharacterUnequipItemEvent: MudEventConstructor<CharacterUnequipItemPayload> = class extends MudEvent<CharacterUnequipItemPayload> {
    public static NAME: string = 'unequip';
    public item: Item;
    public slot: string;
};

export interface CharacterUnfollowedTargetPayload {
    target: Character;
}

export const CharacterUnfollowedTargetEvent: MudEventConstructor<CharacterUnfollowedTargetPayload> = class extends MudEvent<CharacterUnfollowedTargetPayload> {
    public static NAME: string = 'unfollowed';
    public target: Character;
};
