import Character from '../characters/character';
import Item from './item';
import {MudEvent, MudEventConstructor} from '../events/mud-event';

export interface ItemEquippedPayload {
    wearer: Character;
}

export const ItemEquippedEvent: MudEventConstructor<ItemEquippedPayload> = class extends MudEvent<ItemEquippedPayload> {
    public static NAME: string = 'equip';
    public wearer: Character;
};

export interface ItemPutAwayPayload {
    character: Character;
    container: Item;
}

export const ItemPutAwayEvent: MudEventConstructor<ItemPutAwayPayload> = class extends MudEvent<ItemPutAwayPayload> {
    public static NAME: string = 'put';
    public character: Character;
    public container: Item;
};

export const ItemSpawnEvent: MudEventConstructor<{}> = class extends MudEvent<{}> {
    public NAME: string = 'spawn';
};

export interface ItemUnequippedPayload {
    wearer: Character;
}

export const ItemUnequippedEvent: MudEventConstructor<ItemUnequippedPayload> = class extends MudEvent<ItemUnequippedPayload> {
    public static NAME: string = 'unequip';
    public wearer: Character;
};
